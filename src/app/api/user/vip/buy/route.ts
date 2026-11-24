import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { VipTier } from "@/models/VipTier";
import { getCurrentUser } from "@/lib/auth";
import { getActiveVipTiers } from "@/lib/vip";

export const dynamic = "force-dynamic";

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

    const activeTiers = await getActiveVipTiers();
    const tier = activeTiers.find((t) => t.level === vipLevel);

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

    // If auto-activate or direct activation: set user VIP level
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
    console.error("VIP Activation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to activate VIP.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
