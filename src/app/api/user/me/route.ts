import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Kyc } from "@/models/Kyc";
import { BankWallet } from "@/models/BankWallet";
import { getCurrentUser } from "@/lib/auth";
import { syncUserVipWithBalance } from "@/lib/vip";
import { syncDailyOrdersAndEarnings } from "@/lib/dailyStats";

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

    const usdtRate = settings?.usdtRateBDT || 127;
    const signupBonusBDT = user.signupBonusBDT ?? 500;
    const signupBonusUSDT = Number((signupBonusBDT / usdtRate).toFixed(4));
    const totalBalanceUSDT = user.balance || 0;
    const totalBalanceBDT = Number((totalBalanceUSDT * usdtRate).toFixed(2));

    const withdrawableUSDT = Math.max(0, Number((totalBalanceUSDT - signupBonusUSDT).toFixed(4)));
    const withdrawableBDT = Math.max(0, Number((totalBalanceBDT - signupBonusBDT).toFixed(2)));

    const hasWithdrawPassword = Boolean(user.withdrawPasswordHash);
    const { passwordHash: _p, withdrawPasswordHash: _w, ...userSafe } = user.toObject();

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });

    // Check Bank / Wallets
    const wallets = await BankWallet.find({ userId: user._id.toString() });

    return NextResponse.json({
      success: true,
      user: userSafe,
      hasWithdrawPassword,
      kycStatus: kyc ? kyc.status : "not_submitted",
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
