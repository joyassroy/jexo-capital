import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Withdrawal } from "@/models/Withdrawal";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { amount, method, targetAccount, withdrawPassword } = body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid withdrawal amount." },
        { status: 400 }
      );
    }

    if (!method || !["bKash", "Nagad", "USDT-BEP20"].includes(method)) {
      return NextResponse.json(
        { error: "Please select a valid payment method." },
        { status: 400 }
      );
    }

    if (!targetAccount || targetAccount.trim() === "") {
      return NextResponse.json(
        { error: "Please enter or select your recipient wallet/account." },
        { status: 400 }
      );
    }

    if (!withdrawPassword) {
      return NextResponse.json(
        { error: "Please enter your withdrawal password." },
        { status: 400 }
      );
    }

    // 1. Fetch user & verify withdrawal password
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.withdrawPasswordHash) {
      return NextResponse.json(
        {
          error:
            "You have not set a withdrawal password yet. Please set it in Personal Center -> Set Withdrawal Password.",
        },
        { status: 400 }
      );
    }

    const isWithdrawPassCorrect = await verifyPassword(
      withdrawPassword,
      user.withdrawPasswordHash
    );
    if (!isWithdrawPassCorrect) {
      return NextResponse.json(
        { error: "Incorrect withdrawal password." },
        { status: 400 }
      );
    }

    // 2. Fetch withdrawal settings & rules
    let setting = await Setting.findOne({ key: "default_settings" });
    if (!setting) {
      setting = await Setting.create({ key: "default_settings" });
    }

    // Validate Minimum Amount in USDT (min 5 USDT)
    const usdtRate = setting.usdtRateBDT || 127;
    const minLimitUSDT = 5;

    if (withdrawAmount < minLimitUSDT) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is ${minLimitUSDT} USDT (≈ ${(minLimitUSDT * usdtRate).toFixed(0)} BDT).`,
        },
        { status: 400 }
      );
    }

    // Validate User Balance (balance is in USDT)
    if (user.balance < withdrawAmount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Your current balance is ${user.balance.toFixed(2)} USDT (≈ ${(user.balance * usdtRate).toFixed(2)} BDT).`,
        },
        { status: 400 }
      );
    }

    // 3. Validate Working Hours & Days (Sunday to Thursday, 9am - 5pm)
    const now = new Date();
    // Bangladeshi time offset: UTC+6
    const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const dayOfWeek = bdTime.getUTCDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    const allowedDays = setting.withdrawAllowedDays || [0, 1, 2, 3, 4];
    if (!allowedDays.includes(dayOfWeek)) {
      return NextResponse.json(
        {
          error:
            "Withdrawals are closed today. Allowed withdrawal days are Sunday to Thursday (Friday & Saturday are weekly holidays).",
        },
        { status: 400 }
      );
    }

    const currentHour = bdTime.getUTCHours();
    const currentMinute = bdTime.getUTCMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const [startH, startM] = (setting.withdrawStartTime || "09:00")
      .split(":")
      .map(Number);
    const [endH, endM] = (setting.withdrawEndTime || "17:00")
      .split(":")
      .map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentTimeMinutes < startMinutes || currentTimeMinutes > endMinutes) {
      return NextResponse.json(
        {
          error: `Withdrawals are only accepted between ${setting.withdrawStartTime} and ${setting.withdrawEndTime}.`,
        },
        { status: 400 }
      );
    }

    // 4. Calculate 10% fee and arrival amount in USDT & BDT
    const feePercent = setting.withdrawFeePercent || 10;
    const charge = Number(((withdrawAmount * feePercent) / 100).toFixed(4));
    const arrivalAmountUSDT = Number((withdrawAmount - charge).toFixed(4));
    const arrivalAmountBDT = Number((arrivalAmountUSDT * usdtRate).toFixed(2));

    // 5. Deduct balance immediately & create records
    user.balance -= withdrawAmount;
    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: user._id.toString(),
      userPhone: user.phone,
      userNickname: user.nickname,
      method,
      amount: withdrawAmount,
      amountUSDT: withdrawAmount,
      amountBDT: Number((withdrawAmount * usdtRate).toFixed(2)),
      feePercentage: feePercent,
      charge,
      arrivalAmount: arrivalAmountUSDT,
      arrivalAmountBDT,
      targetAccount: targetAccount.trim(),
      status: "pending",
    });

    await Transaction.create({
      userId: user._id.toString(),
      type: "withdraw",
      title: `Withdrawal request (${method})`,
      amount: -withdrawAmount,
      status: "pending",
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        charge,
        arrivalAmountUSDT,
        arrivalAmountBDT,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ${withdrawAmount} USDT submitted! Net arrival: ${arrivalAmountUSDT} USDT (${arrivalAmountBDT} BDT) after 10% fee.`,
      withdrawal,
      newBalance: user.balance,
    });
  } catch (error: unknown) {
    console.error("Withdraw Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit withdrawal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

