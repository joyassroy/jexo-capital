import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Kyc } from "@/models/Kyc";
import { BankWallet } from "@/models/BankWallet";
import { Transaction } from "@/models/Transaction";
import { Deposit } from "@/models/Deposit";
import { getCurrentUser } from "@/lib/auth";
import { syncUserVipWithBalance } from "@/lib/vip";
import {
  syncDailyOrdersAndEarnings,
  getTodayDateStringDhaka,
  getYesterdayDateStringDhaka,
} from "@/lib/dailyStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const [user, settings] = await Promise.all([
      User.findById(userPayload.userId),
      Setting.findOne({ key: "default_settings" }).lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Auto-sync VIP level dynamically based on current user balance
    await syncUserVipWithBalance(user);

    // Auto-sync daily orders and earnings on midnight rollover
    await syncDailyOrdersAndEarnings(user);

    // Reconcile and calculate real database figures from transactions
    const todayStr = getTodayDateStringDhaka();
    const yesterdayStr = getYesterdayDateStringDhaka();

    const [todayAgg, yesterdayAgg, accumulatedAgg, depositAgg] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: user._id.toString(),
            type: "daily_return",
            status: "success",
            "metadata.date": todayStr,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: user._id.toString(),
            type: "daily_return",
            status: "success",
            "metadata.date": yesterdayStr,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: user._id.toString(),
            type: { $in: ["daily_return", "invest_return", "team_return", "refer_commission"] },
            status: "success",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Deposit.aggregate([
        {
          $match: {
            userId: user._id.toString(),
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            totalUSDT: { $sum: "$amountUSDT" },
          },
        },
      ]),
    ]);

    let userChanged = false;

    // Today's earnings
    const dbTodayTotal = todayAgg[0]?.total ? Number(todayAgg[0].total.toFixed(4)) : 0;
    const dbTodayCount = todayAgg[0]?.count || 0;
    if (dbTodayTotal > 0 && (user.todayEarnings || 0) < dbTodayTotal) {
      user.todayEarnings = dbTodayTotal;
      user.todayCommission = dbTodayTotal;
      user.todayOrdersCount = Math.max(user.todayOrdersCount || 0, dbTodayCount);
      userChanged = true;
    }

    // Yesterday's earnings
    const dbYesterdayTotal = yesterdayAgg[0]?.total ? Number(yesterdayAgg[0].total.toFixed(4)) : 0;
    if (dbYesterdayTotal > 0 && (user.yesterdayEarnings || 0) < dbYesterdayTotal) {
      user.yesterdayEarnings = dbYesterdayTotal;
      userChanged = true;
    }

    // Accumulated earnings (fundIncome)
    const dbAccumulated = accumulatedAgg[0]?.total ? Number(accumulatedAgg[0].total.toFixed(4)) : 0;
    if (dbAccumulated > 0 && (user.fundIncome || 0) < dbAccumulated) {
      user.fundIncome = dbAccumulated;
      userChanged = true;
    }

    // Total deposited funds (totalFund)
    const dbTotalFund = depositAgg[0]?.totalUSDT ? Number(depositAgg[0].totalUSDT.toFixed(4)) : 0;
    if (dbTotalFund > 0 && (user.totalFund || 0) < dbTotalFund) {
      user.totalFund = dbTotalFund;
      userChanged = true;
    }

    if (userChanged) {
      await user.save();
    }

    const usdtRate = settings?.usdtRateBDT || 127;
    const signupBonusBDT = user.signupBonusBDT ?? 500;
    const signupBonusUSDT = Number((signupBonusBDT / usdtRate).toFixed(4));
    const totalBalanceUSDT = user.balance || 0;
    const totalBalanceBDT = Number((totalBalanceUSDT * usdtRate).toFixed(2));

    const withdrawableUSDT = Math.max(0, Number((totalBalanceUSDT - signupBonusUSDT).toFixed(4)));
    const withdrawableBDT = Math.max(0, Number((totalBalanceBDT - signupBonusBDT).toFixed(2)));

    const hasWithdrawPassword = Boolean(user.withdrawPasswordHash);
    const {
      passwordHash: _p,
      withdrawPasswordHash: _w,
      plainPassword: _pp,
      plainWithdrawPassword: _pwp,
      ...userSafe
    } = user.toObject();

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });
    const isKycCompleted = Boolean(
      kyc &&
      kyc.nidNumber &&
      kyc.frontPictureUrl &&
      kyc.backPictureUrl &&
      kyc.status !== "rejected"
    );

    // Check Bank / Wallets
    const wallets = await BankWallet.find({ userId: user._id.toString() });

    return NextResponse.json({
      success: true,
      user: userSafe,
      hasWithdrawPassword,
      kycStatus: kyc ? kyc.status : "not_submitted",
      isKycCompleted,
      wallets,
      withdrawable: {
        totalBalanceUSDT,
        totalBalanceBDT,
        signupBonusBDT,
        signupBonusUSDT,
        withdrawableUSDT,
        withdrawableBDT,
        usdtRate,
      },
    });
  } catch (error: unknown) {
    console.error("User Fetch Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch user data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
