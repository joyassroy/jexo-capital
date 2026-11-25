import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Withdrawal } from "@/models/Withdrawal";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { Kyc } from "@/models/Kyc";
import { getCurrentUser, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    // Verify withdrawal day (Withdrawals are strictly closed on Friday and Saturday for weekly settlement)
    const dhakaNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const currentDayOfWeek = dhakaNow.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat
    if (currentDayOfWeek === 5 || currentDayOfWeek === 6) {
      return NextResponse.json(
        {
          error:
            "Withdrawals are closed on Friday and Saturday due to weekly financial audits and settlements. Services resume on Sunday at 10:00 AM.",
          isWeekendClosed: true,
        },
        { status: 400 }
      );
    }

    // Verify that profile and NID documents are completed before allowing withdrawal
    const kyc = await Kyc.findOne({ userId: userPayload.userId });
    if (!kyc || !kyc.nidNumber || !kyc.frontPictureUrl || !kyc.backPictureUrl) {
      return NextResponse.json(
        {
          error: "Please complete your profile and submit your National ID (NID) photos first.",
          requireKyc: true,
        },
        { status: 400 }
      );
    }
    if (kyc.status === "rejected") {
      return NextResponse.json(
        {
          error: "Your NID verification was rejected. Please re-submit your NID photos in Profile.",
          requireKyc: true,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      amount,
      amountBDT: bodyAmountBDT,
      amountUSDT: bodyAmountUSDT,
      currency,
      method,
      targetAccount,
      withdrawPassword,
    } = body;

    let effectiveAmount = amount;
    let effectiveCurrency = currency;

    if (effectiveAmount === undefined || effectiveAmount === null || effectiveAmount === "") {
      if (bodyAmountBDT !== undefined && bodyAmountBDT !== null && bodyAmountBDT !== "") {
        effectiveAmount = bodyAmountBDT;
        if (!effectiveCurrency) effectiveCurrency = "BDT";
      } else if (bodyAmountUSDT !== undefined && bodyAmountUSDT !== null && bodyAmountUSDT !== "") {
        effectiveAmount = bodyAmountUSDT;
        if (!effectiveCurrency) effectiveCurrency = "USDT";
      }
    }

    const rawAmount = Number(effectiveAmount);
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0) {
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

    const usdtRate = setting.usdtRateBDT || 127;

    // Determine normalized amounts in both BDT and USDT
    let amountBDT: number;
    let amountUSDT: number;

    if (
      effectiveCurrency === "BDT" ||
      bodyAmountBDT !== undefined ||
      (!effectiveCurrency && (method === "bKash" || method === "Nagad") && rawAmount >= 20)
    ) {
      amountBDT = Number(rawAmount.toFixed(2));
      amountUSDT = Number((amountBDT / usdtRate).toFixed(4));
    } else {
      amountUSDT = Number(rawAmount.toFixed(4));
      amountBDT = Number((amountUSDT * usdtRate).toFixed(2));
    }

    // Validate Minimum Withdrawal Limits
    // bKash / Nagad: Min 250 BDT; Crypto USDT: Min 6 USDT
    if (method === "bKash" || method === "Nagad") {
      const minBDT = setting.minWithdrawBDT || 250;
      if (amountBDT < minBDT) {
        return NextResponse.json(
          {
            error: `Minimum withdrawal amount for ${method} is ${minBDT} BDT (≈ ${(minBDT / usdtRate).toFixed(2)} USDT).`,
          },
          { status: 400 }
        );
      }
    } else {
      const minUSDT = setting.minWithdrawUSDT || 6;
      if (amountUSDT < minUSDT) {
        return NextResponse.json(
          {
            error: `Minimum withdrawal amount for USDT is ${minUSDT} USDT (≈ ${(minUSDT * usdtRate).toFixed(2)} BDT).`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Validate User Balance & Non-Withdrawable 500 BDT Signup Bonus
    const currentBalanceUSDT = user.balance || 0;
    const currentBalanceBDT = Number((currentBalanceUSDT * usdtRate).toFixed(2));

    const signupBonusBDT = user.signupBonusBDT ?? 500;
    const signupBonusUSDT = Number((signupBonusBDT / usdtRate).toFixed(4));

    // Maximum withdrawable balance excludes the non-withdrawable signup bonus
    const maxWithdrawableUSDT = Math.max(0, Number((currentBalanceUSDT - signupBonusUSDT).toFixed(4)));
    const maxWithdrawableBDT = Math.max(0, Number((currentBalanceBDT - signupBonusBDT).toFixed(2)));

    // Overall balance check
    if (currentBalanceUSDT < amountUSDT) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Your current total balance is ${currentBalanceBDT.toFixed(2)} BDT (${currentBalanceUSDT.toFixed(2)} USDT).`,
        },
        { status: 400 }
      );
    }

    // Non-withdrawable signup bonus reserve check
    if (amountUSDT > maxWithdrawableUSDT) {
      return NextResponse.json(
        {
          error: `The ${signupBonusBDT} BDT welcome deposit cannot be withdrawn. Your maximum withdrawable balance is ${maxWithdrawableBDT.toFixed(2)} BDT (${maxWithdrawableUSDT.toFixed(2)} USDT). The ${signupBonusBDT} BDT bonus must remain in your account.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate Working Hours & Days (Sunday to Thursday, 9am - 5pm)
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

    // 5. Calculate 10% fee and arrival amount in USDT & BDT
    const feePercent = setting.withdrawFeePercent || 10;
    const chargeUSDT = Number(((amountUSDT * feePercent) / 100).toFixed(4));
    const chargeBDT = Number(((amountBDT * feePercent) / 100).toFixed(2));
    const arrivalAmountUSDT = Number((amountUSDT - chargeUSDT).toFixed(4));
    const arrivalAmountBDT = Number((amountBDT - chargeBDT).toFixed(2));

    // 6. Deduct balance immediately & create records
    user.balance = Number((user.balance - amountUSDT).toFixed(4));
    await user.save();

    const withdrawal = await Withdrawal.create({
      userId: user._id.toString(),
      userPhone: user.phone,
      userNickname: user.nickname,
      method,
      amount: amountUSDT,
      amountUSDT,
      amountBDT,
      feePercentage: feePercent,
      charge: chargeUSDT,
      arrivalAmount: arrivalAmountUSDT,
      arrivalAmountBDT,
      targetAccount: targetAccount.trim(),
      status: "pending",
    });

    await Transaction.create({
      userId: user._id.toString(),
      type: "withdraw",
      title: `Withdrawal request (${method})`,
      amount: -amountUSDT,
      status: "pending",
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        method,
        amountBDT,
        chargeUSDT,
        chargeBDT,
        arrivalAmountUSDT,
        arrivalAmountBDT,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ${method === "USDT-BEP20" ? `${amountUSDT} USDT` : `${amountBDT} BDT`} submitted! Net arrival: ${arrivalAmountBDT} BDT (${arrivalAmountUSDT} USDT) after ${feePercent}% fee.`,
      withdrawal,
      newBalance: user.balance,
    });
  } catch (error: unknown) {
    console.error("Withdraw Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit withdrawal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

