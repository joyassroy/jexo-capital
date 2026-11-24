import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { Deposit } from "@/models/Deposit";
import { Setting } from "@/models/Setting";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const currentUserId = userPayload.userId;

    const [currentUser, setting] = await Promise.all([
      User.findById(currentUserId),
      Setting.findOne({ key: "default_settings" }).lean(),
    ]);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usdtRate = setting?.usdtRateBDT || 127;
    const bonusUSDT = 500 / usdtRate;

    // 1. Level 1: Users referred directly by currentUser
    const level1Users = await User.find({ referredBy: currentUserId })
      .select("_id phone nickname totalFund balance todayOrdersCount status createdAt")
      .lean();

    const level1Ids = level1Users.map((u) => u._id.toString());

    // 2. Level 2: Users referred by Level 1 users
    const level2Users =
      level1Ids.length > 0
        ? await User.find({ referredBy: { $in: level1Ids } })
            .select("_id phone nickname totalFund balance todayOrdersCount status createdAt")
            .lean()
        : [];

    const level2Ids = level2Users.map((u) => u._id.toString());

    // 3. Level 3: Users referred by Level 2 users
    const level3Users =
      level2Ids.length > 0
        ? await User.find({ referredBy: { $in: level2Ids } })
            .select("_id phone nickname totalFund balance todayOrdersCount status createdAt")
            .lean()
        : [];

    const allMemberIds = [
      ...level1Ids,
      ...level2Ids,
      level3Users.map((u) => u._id.toString()),
    ].flat();

    // Query approved deposits for all team members
    const approvedDeposits =
      allMemberIds.length > 0
        ? await Deposit.find({
            userId: { $in: allMemberIds },
            status: "approved",
          })
            .select("userId amount amountUSDT")
            .lean()
        : [];

    const depositMap = new Map<string, number>();
    for (const dep of approvedDeposits) {
      const prev = depositMap.get(dep.userId) || 0;
      const amount = dep.amountUSDT > 0 ? dep.amountUSDT : dep.amount || 0;
      depositMap.set(dep.userId, prev + amount);
    }

    const maskPhone = (phone?: string) => {
      if (!phone) return "User";
      const clean = phone.trim();
      if (clean.length <= 6) return clean;
      return clean.slice(0, 3) + "****" + clean.slice(-3);
    };

    // Helper: Determine if user is active via approved deposit or active trading/balance
    const mapMember = (u: any) => {
      const uId = u._id.toString();
      const depAmt = depositMap.get(uId) || 0;
      const totalDep = Math.max(depAmt, u.totalFund || 0);
      const hasDeposited = totalDep > 0;
      const isActive = hasDeposited || (u.balance || 0) > bonusUSDT || (u.todayOrdersCount || 0) > 0;

      return {
        id: uId,
        phone: maskPhone(u.phone),
        nickname: u.nickname || "User",
        hasDeposited,
        isActive,
        depositAmount: Number(totalDep.toFixed(2)),
        balance: Number((u.balance || 0).toFixed(2)),
        joinedAt: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
      };
    };

    const l1Members = level1Users.map(mapMember);
    const l2Members = level2Users.map(mapMember);
    const l3Members = level3Users.map(mapMember);

    const l1Total = l1Members.length;
    const l1Active = l1Members.filter((m) => m.hasDeposited || m.isActive).length;

    const l2Total = l2Members.length;
    const l2Active = l2Members.filter((m) => m.hasDeposited || m.isActive).length;

    const l3Total = l3Members.length;
    const l3Active = l3Members.filter((m) => m.hasDeposited || m.isActive).length;

    const totalMembers = l1Total + l2Total + l3Total;
    const activeMembers = l1Active + l2Active + l3Active;

    // 4. Rewards aggregation from Transactions
    const [referralAgg, cashbackAgg, milestoneTx] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: currentUserId,
            type: "refer_commission",
            status: "success",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: currentUserId,
            type: "team_return",
            status: "success",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.findOne({
        userId: currentUserId,
        type: "bonus",
        title: { $regex: /10.*referral/i },
      }),
    ]);

    const referralRewardsUSDT = referralAgg[0]?.total
      ? Number(referralAgg[0].total.toFixed(4))
      : 0;
    const referralRewardsBDT = Number((referralRewardsUSDT * usdtRate).toFixed(2));

    const cashbackRewardsUSDT = cashbackAgg[0]?.total
      ? Number(cashbackAgg[0].total.toFixed(4))
      : 0;
    const cashbackRewardsBDT = Number((cashbackRewardsUSDT * usdtRate).toFixed(2));

    const milestoneClaimed = Boolean(milestoneTx);
    const canClaimMilestone = !milestoneClaimed && l1Total >= 10;

    return NextResponse.json({
      success: true,
      team: {
        totalMembers,
        activeMembers,
        level1: { total: l1Total, active: l1Active, members: l1Members },
        level2: { total: l2Total, active: l2Active, members: l2Members },
        level3: { total: l3Total, active: l3Active, members: l3Members },
        referralRewardsUSDT,
        referralRewardsBDT,
        cashbackRewardsUSDT,
        cashbackRewardsBDT,
        milestoneClaimed,
        canClaimMilestone,
      },
      usdtRate,
    });
  } catch (error: unknown) {
    console.error("Team API Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load team data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const currentUserId = userPayload.userId;
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const [currentUser, setting] = await Promise.all([
      User.findById(currentUserId),
      Setting.findOne({ key: "default_settings" }).lean(),
    ]);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usdtRate = setting?.usdtRateBDT || 127;

    if (action === "claim_milestone") {
      // Check Level 1 count
      const l1Count = await User.countDocuments({ referredBy: currentUserId });
      if (l1Count < 10) {
        return NextResponse.json(
          { error: `You have referred ${l1Count}/10 members. Refer at least 10 members to claim 300 BDT!` },
          { status: 400 }
        );
      }

      // Check if already claimed
      const existing = await Transaction.findOne({
        userId: currentUserId,
        type: "bonus",
        title: { $regex: /10.*referral/i },
      });

      if (existing) {
        return NextResponse.json(
          { error: "You have already claimed your 10-member referral bonus." },
          { status: 400 }
        );
      }

      const bonusAmountBDT = 300;
      const bonusAmountUSDT = Number((bonusAmountBDT / usdtRate).toFixed(4));

      currentUser.balance = Number((currentUser.balance + bonusAmountUSDT).toFixed(4));
      currentUser.fundIncome = Number(((currentUser.fundIncome || 0) + bonusAmountUSDT).toFixed(4));
      await currentUser.save();

      await Transaction.create({
        userId: currentUserId,
        type: "bonus",
        title: "10-Member Referral Milestone Bonus (300 BDT)",
        amount: bonusAmountUSDT,
        status: "success",
        metadata: {
          amountBDT: bonusAmountBDT,
          usdtRate,
          description: "Milestone bonus for inviting 10 members credited to balance.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Congratulations! 300 BDT milestone bonus credited to your balance.",
        newBalanceBDT: Number((currentUser.balance * usdtRate).toFixed(2)),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Commissions are automatically credited to your main balance whenever your team recharges or earns!",
    });
  } catch (error: unknown) {
    console.error("Team Claim Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process claim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
