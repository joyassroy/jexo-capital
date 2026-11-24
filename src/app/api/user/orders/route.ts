import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser } from "@/lib/auth";
import { getActiveVipTiers, syncUserVipWithBalance } from "@/lib/vip";
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

    const currentVipLevel = user.vipLevel || 0;
    const tier = activeTiers.find((t) => t.level === currentVipLevel);

    const maxOrders = tier?.numberOfOrders || 5;
    const commissionPercent = tier?.commissionPerOrderPercent || 0.5;
    const dailyReturnPercent = tier?.dailyReturnPercent || (commissionPercent * maxOrders);

    const userBalanceUSDT = user.balance || 0;
    const userBalanceBDT = Number((userBalanceUSDT * usdtRate).toFixed(2));
    const todayCommissionUSDT = user.todayCommission || 0;
    const todayCommissionBDT = Number((todayCommissionUSDT * usdtRate).toFixed(2));
    const todayOrdersCount = user.todayOrdersCount || 0;
    const freezeFundsBDT = Number(((user.freezeBalance || 0) * usdtRate).toFixed(2));

    const estimatedNextCommissionUSDT =
      currentVipLevel > 0
        ? Number(((userBalanceUSDT * commissionPercent) / 100).toFixed(4))
        : 0;
    const estimatedNextCommissionBDT = Number(
      (estimatedNextCommissionUSDT * usdtRate).toFixed(2)
    );

    return NextResponse.json({
      success: true,
      user: {
        vipLevel: currentVipLevel,
        tierName: tier?.name || `VIP-${currentVipLevel}`,
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
        isQualified: currentVipLevel >= 1 && userBalanceBDT >= 1000,
        minBDTRequired: tier?.minBDT || 1000,
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

    const currentVipLevel = user.vipLevel || 0;
    const tier = activeTiers.find((t) => t.level === currentVipLevel);
    const maxOrders = tier?.numberOfOrders || 5;

    // 1. Check if user meets minimum VIP-1 requirements
    const balanceBDT = (user.balance || 0) * usdtRate;
    if (currentVipLevel < 1 || balanceBDT < 1000) {
      return NextResponse.json(
        {
          error:
            "Minimum VIP-1 balance (1,000 Tk / ~7.87 USDT) required to earn daily order commission. Please recharge your wallet.",
        },
        { status: 400 }
      );
    }

    // 2. Check if daily orders limit (5) has been reached
    if ((user.todayOrdersCount || 0) >= maxOrders) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${user.todayOrdersCount}/${maxOrders} orders completed). Next orders will unlock tomorrow at 12:00 AM.`,
        },
        { status: 400 }
      );
    }

    // 3. Calculate commission based on VIP level
    const commissionPercent = tier?.commissionPerOrderPercent || 0.5;
    const commissionUSDT = Number(
      Math.max(0.001, (user.balance * commissionPercent) / 100).toFixed(4)
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
