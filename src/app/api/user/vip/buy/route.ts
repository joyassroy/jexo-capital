import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface VipTierSpec {
  level: number;
  name: string;
  dailyReturnPercent: number;
  ordersCount: number;
  commissionPerOrderPercent: number;
  minBDT: number;
  maxBDT: number;
}

const VIP_TIERS: Record<number, VipTierSpec> = {
  1: {
    level: 1,
    name: "Vip-1",
    dailyReturnPercent: 5.0,
    ordersCount: 5,
    commissionPerOrderPercent: 0.5,
    minBDT: 1000,
    maxBDT: 2999,
  },
  2: {
    level: 2,
    name: "Vip-2",
    dailyReturnPercent: 6.0,
    ordersCount: 5,
    commissionPerOrderPercent: 0.6,
    minBDT: 3000,
    maxBDT: 9999,
  },
  3: {
    level: 3,
    name: "Vip-3",
    dailyReturnPercent: 7.0,
    ordersCount: 5,
    commissionPerOrderPercent: 0.7,
    minBDT: 10000,
    maxBDT: 49999,
  },
  4: {
    level: 4,
    name: "Vip-4",
    dailyReturnPercent: 8.0,
    ordersCount: 5,
    commissionPerOrderPercent: 0.8,
    minBDT: 50000,
    maxBDT: 99999,
  },
};

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const vipLevel = Number(body.vipLevel);
    let amountBDT = Number(body.amountBDT);

    const tier = VIP_TIERS[vipLevel];
    if (!tier) {
      return NextResponse.json(
        { error: "Invalid VIP level selected." },
        { status: 400 }
      );
    }

    // If no custom amount provided, default to minimum required for this tier
    if (!amountBDT || isNaN(amountBDT) || amountBDT < tier.minBDT) {
      amountBDT = tier.minBDT;
    }

    if (amountBDT > tier.maxBDT) {
      return NextResponse.json(
        {
          error: `Amount exceeds maximum limit for VIP-${vipLevel} (${tier.maxBDT} BDT).`,
        },
        { status: 400 }
      );
    }

    // Fetch live settings for USDT to BDT exchange rate
    const settings = await Setting.findOne();
    const usdtRate = settings?.usdtRateBDT || 127;
    const amountUSDT = Number((amountBDT / usdtRate).toFixed(2));

    // Fetch user
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check balance
    if (user.balance < amountUSDT) {
      const neededUSDT = (amountUSDT - user.balance).toFixed(2);
      return NextResponse.json(
        {
          error: `Insufficient balance! You need ${neededUSDT} USDT (${(Number(neededUSDT) * usdtRate).toFixed(0)} Tk) more to activate ${tier.name}.`,
          insufficientBalance: true,
          neededUSDT: Number(neededUSDT),
          currentBalance: user.balance,
          requiredUSDT: amountUSDT,
        },
        { status: 400 }
      );
    }

    // Deduct from main balance and update user
    user.balance = Number((user.balance - amountUSDT).toFixed(2));
    user.totalFund = Number(((user.totalFund || 0) + amountUSDT).toFixed(2));
    user.vipLevel = tier.level;
    await user.save();

    // Record Transaction in Ledger
    await Transaction.create({
      userId: user._id.toString(),
      type: "invest_return",
      title: `Activated ${tier.name} (${amountBDT.toLocaleString()} Tk)`,
      amount: amountUSDT,
      status: "success",
      metadata: {
        kind: "vip_purchase",
        vipLevel: tier.level,
        amountBDT,
        amountUSDT,
        rate: usdtRate,
        dailyReturnPercent: tier.dailyReturnPercent,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Congratulations! ${tier.name} activated successfully.`,
      newBalance: user.balance,
      vipLevel: user.vipLevel,
      amountDeductedUSDT: amountUSDT,
      amountDeductedBDT: amountBDT,
    });
  } catch (error: unknown) {
    console.error("VIP Purchase Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to activate VIP package.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
