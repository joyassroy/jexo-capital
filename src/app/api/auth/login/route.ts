import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ensureDbInitialized } from "@/lib/init-db";
import {
  verifyPassword,
  signUserToken,
  USER_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    await connectDB();

    const body = await req.json();
    const { phone, password, keepSignedIn } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Please enter your mobile number and password." },
        { status: 400 }
      );
    }

    // Clean and normalize phone number for any international or local format
    const rawTrimmed = phone.trim();
    const cleanDigits = rawTrimmed.replace(/[^0-9]/g, "");

    const possiblePhones = Array.from(
      new Set(
        [
          rawTrimmed,
          cleanDigits,
          `+${cleanDigits}`,
          cleanDigits.startsWith("880") ? "0" + cleanDigits.slice(3) : null,
          cleanDigits.startsWith("0") ? "880" + cleanDigits.slice(1) : null,
          cleanDigits.startsWith("0") ? cleanDigits.slice(1) : null,
        ].filter(Boolean) as string[]
      )
    );

    const user = await User.findOne({
      phone: { $in: possiblePhones },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid mobile number or password." },
        { status: 401 }
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid mobile number or password." },
        { status: 401 }
      );
    }

    // Sign JWT and set cookie
    const token = signUserToken(
      {
        userId: user._id.toString(),
        phone: user.phone,
        nickname: user.nickname,
        role: "user",
      },
      Boolean(keepSignedIn)
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        balance: user.balance,
        vipLevel: user.vipLevel,
        referralCode: user.referralCode,
      },
    });

    const maxAge = keepSignedIn ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login Error:", error);
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

