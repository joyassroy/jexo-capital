import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Deposit } from "@/models/Deposit";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { getCurrentAdmin } from "@/lib/auth";
import { syncUserVipWithBalance } from "@/lib/vip";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const deposits = await Deposit.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, deposits });
  } catch (error: unknown) {
    console.error("Admin Get Deposits Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch deposits.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { depositId, action, adminNote } = body; // action: 'approve' | 'reject'

    if (!depositId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid deposit ID or action." },
        { status: 400 }
      );
    }

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found." }, { status: 404 });
    }

    if (deposit.status !== "pending") {
      return NextResponse.json(
        { error: `Deposit has already been ${deposit.status}.` },
        { status: 400 }
      );
    }

    const user = await User.findById(deposit.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "approve") {
      deposit.status = "approved";
      deposit.adminNote = adminNote || "Approved by admin";
      deposit.reviewedBy = admin.username;
      deposit.reviewedAt = new Date();
      await deposit.save();

      // Determine USDT credit amount (1 USDT = 127 BDT)
      const creditUSDT = deposit.amountUSDT > 0
        ? deposit.amountUSDT
        : Number((deposit.amountBDT / (deposit.method === "USDT-BEP20" ? 1 : 127)).toFixed(4));

      // Credit user's balance and totalFund in USDT
      user.balance = Number((user.balance + creditUSDT).toFixed(4));
      user.totalFund = Number(((user.totalFund || 0) + creditUSDT).toFixed(4));
      await user.save();

      // Automatically sync and upgrade user's VIP level if new balance qualifies
      await syncUserVipWithBalance(user);

      // Create transaction record
      await Transaction.create({
        userId: user._id.toString(),
        type: "recharge",
        title: `Recharge (${deposit.method})`,
        amount: creditUSDT,
        status: "success",
        metadata: {
          depositId: deposit._id.toString(),
          method: deposit.method,
          transactionId: deposit.transactionId,
          amountBDT: deposit.amountBDT,
          amountUSDT: creditUSDT,
        },
      });

      // 10% First Deposit Bonus for Direct Referrer Only
      // Only given on the user's first approved deposit! Subsequent deposits do not grant referral commission.
      const previousApprovedDepositsCount = await Deposit.countDocuments({
        userId: user._id.toString(),
        status: "approved",
        _id: { $ne: deposit._id },
      });

      const isFirstDeposit = previousApprovedDepositsCount === 0;
      deposit.isFirstDeposit = isFirstDeposit;
      await deposit.save();

      if (isFirstDeposit && user.referredBy) {
        const directReferrer = await User.findById(user.referredBy);
        if (directReferrer) {
          const referralBonusUSDT = Number(((creditUSDT * 10) / 100).toFixed(4));
          if (referralBonusUSDT > 0) {
            directReferrer.unclaimedReferralRewardsUSDT = Number(
              ((directReferrer.unclaimedReferralRewardsUSDT || 0) + referralBonusUSDT).toFixed(4)
            );
            await directReferrer.save();

            // Track this first-deposit bonus in transactions as pending claim
            await Transaction.create({
              userId: directReferrer._id.toString(),
              type: "refer_commission",
              title: `10% 1st Deposit Bonus from ${user.nickname} (Pending Claim)`,
              amount: referralBonusUSDT,
              status: "pending",
              metadata: {
                fromUserId: user._id.toString(),
                fromUserPhone: user.phone,
                depositId: deposit._id.toString(),
                firstDepositUSDT: creditUSDT,
                bonusUSDT: referralBonusUSDT,
                bonusBDT: Number((referralBonusUSDT * 127).toFixed(2)),
                isFirstDeposit: true,
              },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Deposit of ${deposit.amountBDT} BDT (${creditUSDT.toFixed(2)} USDT) approved and credited to user account.`,
        deposit,
      });
    } else {
      // Reject
      deposit.status = "rejected";
      deposit.adminNote = adminNote || "Rejected by admin";
      deposit.reviewedBy = admin.username;
      deposit.reviewedAt = new Date();
      await deposit.save();

      return NextResponse.json({
        success: true,
        message: "Deposit has been rejected.",
        deposit,
      });
    }
  } catch (error: unknown) {
    console.error("Admin Update Deposit Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update deposit.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
