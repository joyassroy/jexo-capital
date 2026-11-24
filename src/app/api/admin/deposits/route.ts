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

      // Credit user's balance in USDT
      user.balance += creditUSDT;
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

      // 3-Tier Referral Commission Check on Deposit (calculated in USDT)
      // Level 1: 10%
      if (user.referredBy) {
        const level1User = await User.findById(user.referredBy);
        if (level1User) {
          const l1Bonus = Number(((creditUSDT * 10) / 100).toFixed(4));
          level1User.balance += l1Bonus;
          level1User.fundIncome += l1Bonus;
          await level1User.save();

          await Transaction.create({
            userId: level1User._id.toString(),
            type: "refer_commission",
            title: `Referral commission from ${user.nickname} (10%)`,
            amount: l1Bonus,
            status: "success",
            metadata: { fromUserId: user._id.toString(), level: 1 },
          });

          // Level 2: 5%
          if (level1User.referredBy) {
            const level2User = await User.findById(level1User.referredBy);
            if (level2User) {
              const l2Bonus = Number(((creditUSDT * 5) / 100).toFixed(4));
              level2User.balance += l2Bonus;
              level2User.fundIncome += l2Bonus;
              await level2User.save();

              await Transaction.create({
                userId: level2User._id.toString(),
                type: "team_return",
                title: `Team level 2 return commission (5%)`,
                amount: l2Bonus,
                status: "success",
                metadata: { fromUserId: user._id.toString(), level: 2 },
              });

              // Level 3: 3%
              if (level2User.referredBy) {
                const level3User = await User.findById(level2User.referredBy);
                if (level3User) {
                  const l3Bonus = Number(((creditUSDT * 3) / 100).toFixed(4));
                  level3User.balance += l3Bonus;
                  level3User.fundIncome += l3Bonus;
                  await level3User.save();

                  await Transaction.create({
                    userId: level3User._id.toString(),
                    type: "team_return",
                    title: `Team level 3 return commission (3%)`,
                    amount: l3Bonus,
                    status: "success",
                    metadata: { fromUserId: user._id.toString(), level: 3 },
                  });
                }
              }
            }
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
