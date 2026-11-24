import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { Transaction } from "@/models/Transaction";
import { ensureDbInitialized } from "@/lib/init-db";
import { syncUserVipWithBalance } from "@/lib/vip";
import {
  hashPassword,
  generateReferralCode,
  signUserToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    await connectDB();

    const body = await req.json();
    const {
      nickname,
      countryCode = "+880",
      phone,
      password,
      confirmPassword,
      referralCode,
    } = body;

    // 1. Validation
    if (!nickname || !phone || !password) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (password.length < 4 || password.length > 10) {
      return NextResponse.json(
        { error: "Password must be 4 to 10 digits/characters." },
        { status: 400 }
      );
    }

    // Clean and validate mobile number
    const rawTrimmed = phone.trim();
    const cleanCountryCode = countryCode.replace(/[^0-9]/g, "");
    let numDigits = rawTrimmed.replace(/[^0-9]/g, "");
    if (cleanCountryCode && numDigits.startsWith(cleanCountryCode)) {
      numDigits = numDigits.slice(cleanCountryCode.length);
    }
    const numWithoutZero = numDigits.replace(/^0+/, "");

    if (numWithoutZero.length < 4 || numWithoutZero.length > 15) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number." },
        { status: 400 }
      );
    }

    const localWithZero = `0${numWithoutZero}`;
    const intlFormat = `+${cleanCountryCode}${numWithoutZero}`;
    const intlDigits = `${cleanCountryCode}${numWithoutZero}`;

    const possiblePhones = Array.from(
      new Set(
        [
          rawTrimmed,
          numDigits,
          numWithoutZero,
          localWithZero,
          intlFormat,
          intlDigits,
          `+${numDigits}`,
          `+${rawTrimmed.replace(/^\+/, "")}`,
        ].filter(Boolean) as string[]
      )
    );

    // 2. Check if phone is already registered
    const existingUser = await User.findOne({
      phone: { $in: possiblePhones },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "This mobile number is already registered. Please login." },
        { status: 400 }
      );
    }

    // 3. Handle Referral Code (Optional)
    let referredByUser = null;
    if (referralCode && referralCode.trim() !== "") {
      referredByUser = await User.findOne({
        referralCode: referralCode.trim(),
      });
    }

    // 4. Generate unique referral code for new user
    let newReferralCode = generateReferralCode();
    while (await User.findOne({ referralCode: newReferralCode })) {
      newReferralCode = generateReferralCode();
    }

    // 5. Create User with 500 BDT Free Welcome Deposit
    // For Bangladesh (+880), save in the local 017xxxxxxxx format (e.g. 01712345678).
    // For international countries, save in the full +[code][number] format (e.g. +14155552671).
    const savedPhone = cleanCountryCode === "880" ? localWithZero : intlFormat;
    const passwordHash = await hashPassword(password);

    const setting = await Setting.findOne({ key: "default_settings" }).lean();
    const usdtRate = setting?.usdtRateBDT || 127;
    const signupBonusBDT = setting?.signupBonusBDT ?? 500;
    const signupBonusUSDT = Number((signupBonusBDT / usdtRate).toFixed(4));

    const newUser = await User.create({
      phone: savedPhone,
      nickname: nickname.trim(),
      passwordHash,
      balance: signupBonusUSDT,
      signupBonusBDT: signupBonusBDT,
      totalFund: 0,
      fundIncome: 0,
      yesterdayEarnings: 0,
      todayEarnings: 0,
      vipLevel: 0,
      referralCode: newReferralCode,
      referredBy: referredByUser ? referredByUser._id.toString() : undefined,
      referralCount: 0,
      status: "active",
    });

    // Create a transaction record for the 500 BDT sign-up bonus
    await Transaction.create({
      userId: newUser._id.toString(),
      type: "bonus",
      title: "Welcome Sign-up Bonus (500 Tk)",
      amount: signupBonusUSDT,
      status: "success",
      metadata: {
        amountBDT: signupBonusBDT,
        usdtRate,
        nonWithdrawable: true,
        description: "Free 500 BDT welcome deposit credited automatically upon registration.",
      },
    });

    // Sync VIP level
    await syncUserVipWithBalance(newUser);

    // If referred by someone, increment referrer's count
    if (referredByUser) {
      await User.findByIdAndUpdate(referredByUser._id, {
        $inc: { referralCount: 1 },
      });
    }

    // 6. Sign JWT and set cookie
    const token = signUserToken({
      userId: newUser._id.toString(),
      phone: newUser.phone,
      nickname: newUser.nickname,
      role: "user",
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful!",
      user: {
        id: newUser._id,
        phone: newUser.phone,
        nickname: newUser.nickname,
        balance: newUser.balance,
        referralCode: newUser.referralCode,
      },
    });

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Register Error:", error);
    const message = error instanceof Error ? error.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

