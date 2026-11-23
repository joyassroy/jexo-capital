import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ensureDbInitialized } from "@/lib/init-db";
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
    const { nickname, phone, password, confirmPassword, referralCode } = body;

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

    // Clean and validate mobile number for any country
    const rawTrimmed = phone.trim();
    const cleanDigits = rawTrimmed.replace(/[^0-9]/g, "");

    if (cleanDigits.length < 6 || cleanDigits.length > 16) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number (6 to 16 digits)." },
        { status: 400 }
      );
    }

    const possiblePhones = Array.from(
      new Set(
        [
          rawTrimmed,
          cleanDigits,
          `+${cleanDigits}`,
          cleanDigits.startsWith("880") ? "0" + cleanDigits.slice(3) : null,
          cleanDigits.startsWith("0") ? "880" + cleanDigits.slice(1) : null,
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

    // 5. Create User
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      phone: cleanDigits,
      nickname: nickname.trim(),
      passwordHash,
      balance: 0,
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

