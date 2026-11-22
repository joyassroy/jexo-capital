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

    // Clean phone number
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("880")
      ? cleanPhone.slice(2)
      : cleanPhone;

    const user = await User.findOne({ phone: formattedPhone });
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

