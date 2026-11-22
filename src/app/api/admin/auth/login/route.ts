import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Admin } from "@/models/Admin";
import { ensureDbInitialized } from "@/lib/init-db";
import {
  verifyPassword,
  signAdminToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureDbInitialized();
    await connectDB();

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Please enter username/email and password." },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({
      $or: [
        { username: username.trim() },
        { email: username.trim().toLowerCase() },
      ],
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const token = signAdminToken({
      adminId: admin._id.toString(),
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful!",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin Login Error:", error);
    const message = error instanceof Error ? error.message : "Admin login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

