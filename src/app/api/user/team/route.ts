import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
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

    // 1. Level 1: Users referred directly by currentUser
    const level1Users = await User.find({ referredBy: currentUserId })
      .select("_id phone nickname totalFund balance status createdAt")
      .lean();

    const level1Ids = level1Users.map((u) => u._id.toString());

    // 2. Level 2: Users referred by Level 1 users
    const level2Users =
      level1Ids.length > 0
        ? await User.find({ referredBy: { $in: level1Ids } })
            .select("_id phone nickname totalFund balance status createdAt")
            .lean()
        : [];

    const level2Ids = level2Users.map((u) => u._id.toString());

    // 3. Level 3: Users referred by Level 2 users
    const level3Users =
      level2Ids.length > 0
        ? await User.find({ referredBy: { $in: level2Ids } })
            .select("_id phone nickname totalFund balance status createdAt")
            .lean()
        : [];

    // Helper: Active user has totalFund > 0 or has active balance
    const isUserActive = (u: { totalFund?: number; balance?: number }) => {
      return (u.totalFund || 0) > 0 || (u.balance || 0) > 4;
    };

    const l1Total = level1Users.length;
    const l1Active = level1Users.filter(isUserActive).length;

    const l2Total = level2Users.length;
    const l2Active = level2Users.filter(isUserActive).length;

    const l3Total = level3Users.length;
    const l3Active = level3Users.filter(isUserActive).length;

    const totalMembers = l1Total + l2Total + l3Total;
    const activeMembers = l1Active + l2Active + l3Active;

    // 4. Rewards aggregation from Transactions
    const [referralAgg, cashbackAgg] = await Promise.all([
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
    ]);

    const referralRewardsUSDT = referralAgg[0]?.total
      ? Number(referralAgg[0].total.toFixed(4))
      : 0;
    const referralRewardsBDT = Number((referralRewardsUSDT * usdtRate).toFixed(2));

    const cashbackRewardsUSDT = cashbackAgg[0]?.total
      ? Number(cashbackAgg[0].total.toFixed(4))
      : 0;
    const cashbackRewardsBDT = Number((cashbackRewardsUSDT * usdtRate).toFixed(2));

    return NextResponse.json({
      success: true,
      team: {
        totalMembers,
        activeMembers,
        level1: { total: l1Total, active: l1Active },
        level2: { total: l2Total, active: l2Active },
        level3: { total: l3Total, active: l3Active },
        referralRewardsUSDT,
        referralRewardsBDT,
        cashbackRewardsUSDT,
        cashbackRewardsBDT,
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
