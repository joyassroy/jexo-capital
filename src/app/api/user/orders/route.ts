import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser } from "@/lib/auth";
import { getActiveVipTiers, syncUserVipWithBalance, calculateVipLevelForBalance } from "@/lib/vip";
import { getTodayDateStringDhaka, syncDailyOrdersAndEarnings } from "@/lib/dailyStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-sync VIP level with current account balance
    await syncUserVipWithBalance(user);

    // Auto-check and reset daily orders count at midnight (12:00 AM Asia/Dhaka)
    await syncDailyOrdersAndEarnings(user);

    const [settings, activeTiers] = await Promise.all([
      Setting.findOne().lean(),
      getActiveVipTiers(),
    ]);

    const usdtRate = settings?.usdtRateBDT || 127;
    const todayStr = getTodayDateStringDhaka();

    const userBalanceUSDT = user.balance || 0;
    const userBalanceBDT = Math.round(userBalanceUSDT * usdtRate * 100) / 100;

    const currentVipLevel = user.vipLevel ?? 0;
    let tier = activeTiers.find((t) => t.level === currentVipLevel);

    // If tier not found for currentVipLevel, check if user qualifies for any active tier by balance
    if (!tier && activeTiers.length > 0) {
      const qualifyingLevel = calculateVipLevelForBalance(userBalanceUSDT, usdtRate, activeTiers);
      tier = activeTiers.find((t) => t.level === qualifyingLevel);
    }

    const lowestActiveTier = activeTiers.length > 0
      ? [...activeTiers].sort((a, b) => a.minBDT - b.minBDT)[0]
      : null;

    const minBDTRequired = tier ? tier.minBDT : (lowestActiveTier?.minBDT ?? 500);
    // VIP-0 / Free 500 Tk signup bonus users are fully qualified to place daily orders!
    const isLevelZero = (tier?.level === 0) || (currentVipLevel === 0);
    const hasSignupBonus = (user.signupBonusBDT ?? 0) > 0 || userBalanceUSDT >= 3.9;
    const isQualified = isLevelZero
      ? (userBalanceUSDT > 0 || hasSignupBonus)
      : (tier ? (userBalanceBDT + 2) >= tier.minBDT : (userBalanceBDT + 2) >= (lowestActiveTier?.minBDT ?? 1000));

    const maxOrders = tier?.numberOfOrders || 5;
    const commissionPercent = tier?.commissionPerOrderPercent || 0.2;
    const dailyReturnPercent = tier?.dailyReturnPercent || (commissionPercent * maxOrders);

    const todayCommissionUSDT = user.todayCommission || 0;
    const todayCommissionBDT = Number((todayCommissionUSDT * usdtRate).toFixed(2));
    const todayOrdersCount = user.todayOrdersCount || 0;
    const freezeFundsBDT = Number(((user.freezeBalance || 0) * usdtRate).toFixed(2));

    const effectiveBalanceUSDT = Math.max(
      userBalanceUSDT,
      user.signupBonusBDT ? Number((user.signupBonusBDT / usdtRate).toFixed(4)) : 3.937
    );
    const estimatedNextCommissionUSDT =
      tier && isQualified
        ? Number(((effectiveBalanceUSDT * commissionPercent) / 100).toFixed(4))
        : 0;
    const estimatedNextCommissionBDT = Number(
      (estimatedNextCommissionUSDT * usdtRate).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      user: {
        vipLevel: tier?.level ?? currentVipLevel,
        tierName: tier?.name || (currentVipLevel === 0 ? "VIP-0" : `VIP-${currentVipLevel}`),
        balanceUSDT: userBalanceUSDT,
        balanceBDT: userBalanceBDT,
        freezeFundsBDT,
        todayCommissionUSDT,
        todayCommissionBDT,
        todayOrdersCount,
        maxOrders,
        dailyReturnPercent,
        commissionPercent,
        estimatedNextCommissionUSDT,
        estimatedNextCommissionBDT,
        hasReachedLimit: todayOrdersCount >= maxOrders,
        isQualified,
        minBDTRequired,
      },
      usdtRate,
      todayDate: todayStr,
    });
  } catch (error: unknown) {
    console.error("Orders GET Error:", error);
    const message = error instanceof Error ? error.message : "Failed to load order data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { error: "Your account is temporarily suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Auto-sync VIP level before evaluating order
    await syncUserVipWithBalance(user);

    // Auto-check and reset daily orders count at midnight (12:00 AM Asia/Dhaka)
    await syncDailyOrdersAndEarnings(user);

    const [settings, activeTiers] = await Promise.all([
      Setting.findOne().lean(),
      getActiveVipTiers(),
    ]);

    const usdtRate = settings?.usdtRateBDT || 127;
    const todayStr = getTodayDateStringDhaka();

    const currentVipLevel = user.vipLevel ?? 0;
    let tier = activeTiers.find((t) => t.level === currentVipLevel);
    if (!tier && activeTiers.length > 0) {
      const qualifyingLevel = calculateVipLevelForBalance(user.balance || 0, usdtRate, activeTiers);
      tier = activeTiers.find((t) => t.level === qualifyingLevel);
    }

    const lowestActiveTier = activeTiers.length > 0
      ? [...activeTiers].sort((a, b) => a.minBDT - b.minBDT)[0]
      : null;

    const minRequiredBDT = tier ? tier.minBDT : (lowestActiveTier?.minBDT ?? 500);
    const balanceBDT = Math.round(((user.balance || 0) * usdtRate) * 100) / 100;

    // 1. Check if user meets minimum requirements for active tier
    // For VIP 0 / Level 0, users with free 500 Tk signup bonus (or any positive balance) are fully qualified!
    // For other tiers, allow a 2 Tk rounding margin.
    const isLevelZero = (tier?.level === 0) || (currentVipLevel === 0);
    const hasSignupBonus = (user.signupBonusBDT ?? 0) > 0 || (user.balance || 0) >= 3.9;
    const qualifiesByBalance = isLevelZero
      ? ((user.balance || 0) > 0 || hasSignupBonus)
      : ((balanceBDT + 2) >= minRequiredBDT);

    if (!tier || !qualifiesByBalance) {
      const tierName = tier?.name || lowestActiveTier?.name || "VIP";
      return NextResponse.json(
        {
          error: `Minimum ${tierName} balance (${minRequiredBDT.toLocaleString()} Tk / ~${(minRequiredBDT / usdtRate).toFixed(2)} USDT) required to earn daily order commission. Please recharge your wallet.`,
        },
        { status: 400 }
      );
    }

    const maxOrders = tier?.numberOfOrders || 5;

    // 2. Check if daily orders limit has been reached
    if ((user.todayOrdersCount || 0) >= maxOrders) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${user.todayOrdersCount}/${maxOrders} orders completed). Next orders will unlock tomorrow at 12:00 AM.`,
        },
        { status: 400 }
      );
    }

    // 3. Calculate commission based on VIP level
    const commissionPercent = tier?.commissionPerOrderPercent || 0.2;
    const effectiveBalanceUSDT = Math.max(
      user.balance || 0,
      user.signupBonusBDT ? Number((user.signupBonusBDT / usdtRate).toFixed(4)) : 3.937
    );
    const commissionUSDT = Number(
      Math.max(0.001, (effectiveBalanceUSDT * commissionPercent) / 100).toFixed(4)
    );
    const commissionBDT = Number((commissionUSDT * usdtRate).toFixed(2));

    // 4. Update user balance and order records
    user.balance = Number((user.balance + commissionUSDT).toFixed(4));
    user.todayCommission = Number(
      ((user.todayCommission || 0) + commissionUSDT).toFixed(4)
    );
    user.todayEarnings = Number(
      ((user.todayEarnings || 0) + commissionUSDT).toFixed(4)
    );
    user.fundIncome = Number(
      ((user.fundIncome || 0) + commissionUSDT).toFixed(4)
    );
    user.todayOrdersCount = (user.todayOrdersCount || 0) + 1;
    user.lastOrderDate = todayStr;

    await user.save();

    // 5. Create transaction record
    await Transaction.create({
      userId: user._id,
      type: "daily_return",
      title: `Daily Necessities Order #${user.todayOrdersCount} Commission`,
      amount: commissionUSDT,
      status: "success",
      metadata: {
        orderNumber: user.todayOrdersCount,
        maxOrders,
        vipLevel: currentVipLevel,
        commissionPercent,
        commissionUSDT,
        commissionBDT,
        usdtRate,
        date: todayStr,
      },
    });

    // 6. 3-Tier Team Cashback Sharing from Order Earnings:
    // VIP 0 players are free trial players; their earnings DO NOT yield upline commissions!
    // Level 1: 10% of order income (Only for VIP-1 and higher players)
    // Level 2: 5% of order income (Only for VIP-1 and higher players)
    // Level 3: 3% of order income (Only for VIP-1 and higher players)
    // Stored in database in upline's unclaimedCashbackRewardsUSDT for Right-Button Claiming
    const isPlayerVipZero = (user.vipLevel ?? 0) === 0 || (tier?.level ?? 0) === 0;
    if (user.referredBy && commissionUSDT > 0 && !isPlayerVipZero) {
      try {
        const l1User = await User.findById(user.referredBy);
        if (l1User) {
          const l1Reward = Number(((commissionUSDT * 10) / 100).toFixed(4));
          if (l1Reward > 0) {
            l1User.unclaimedCashbackRewardsUSDT = Number(
              ((l1User.unclaimedCashbackRewardsUSDT || 0) + l1Reward).toFixed(4)
            );
            await l1User.save();
          }

          if (l1User.referredBy) {
            const l2User = await User.findById(l1User.referredBy);
            if (l2User) {
              const l2Reward = Number(((commissionUSDT * 5) / 100).toFixed(4));
              if (l2Reward > 0) {
                l2User.unclaimedCashbackRewardsUSDT = Number(
                  ((l2User.unclaimedCashbackRewardsUSDT || 0) + l2Reward).toFixed(4)
                );
                await l2User.save();
              }

              if (l2User.referredBy) {
                const l3User = await User.findById(l2User.referredBy);
                if (l3User) {
                  const l3Reward = Number(((commissionUSDT * 3) / 100).toFixed(4));
                  if (l3Reward > 0) {
                    l3User.unclaimedCashbackRewardsUSDT = Number(
                      ((l3User.unclaimedCashbackRewardsUSDT || 0) + l3Reward).toFixed(4)
                    );
                    await l3User.save();
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error distributing team order commission cashback:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order #${user.todayOrdersCount} completed successfully!`,
      earnedCommissionUSDT: commissionUSDT,
      earnedCommissionBDT: commissionBDT,
      newBalanceUSDT: user.balance,
      newBalanceBDT: Number((user.balance * usdtRate).toFixed(2)),
      todayOrdersCount: user.todayOrdersCount,
      maxOrders,
      todayCommissionUSDT: user.todayCommission,
      todayCommissionBDT: Number((user.todayCommission * usdtRate).toFixed(2)),
      hasReachedLimit: user.todayOrdersCount >= maxOrders,
    });
  } catch (error: unknown) {
    console.error("Orders POST Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
