import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCurrentUser, verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 4 || newPassword.length > 10) {
      return NextResponse.json(
        { error: "Password must be 4 to 10 digits." },
        { status: 400 }
      );
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await verifyPassword(oldPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect old login password." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Login password updated successfully!",
    });
  } catch (error: unknown) {
    console.error("Change Password Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

