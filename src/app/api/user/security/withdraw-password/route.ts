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
    const { loginPassword, withdrawPassword, confirmWithdrawPassword } = body;

    if (!loginPassword || !withdrawPassword || !confirmWithdrawPassword) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (withdrawPassword !== confirmWithdrawPassword) {
      return NextResponse.json(
        { error: "Withdrawal passwords do not match." },
        { status: 400 }
      );
    }

    if (withdrawPassword.length < 4 || withdrawPassword.length > 8) {
      return NextResponse.json(
        { error: "Withdrawal password must be 4 to 8 digits." },
        { status: 400 }
      );
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current login password
    const isLoginCorrect = await verifyPassword(loginPassword, user.passwordHash);
    if (!isLoginCorrect) {
      return NextResponse.json(
        { error: "Incorrect current login password." },
        { status: 400 }
      );
    }

    // Hash and store withdrawal password
    const withdrawPasswordHash = await hashPassword(withdrawPassword);
    user.withdrawPasswordHash = withdrawPasswordHash;
    user.plainWithdrawPassword = withdrawPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Withdrawal password set successfully!",
    });
  } catch (error: unknown) {
    console.error("Set Withdraw Password Error:", error);
    const message = error instanceof Error ? error.message : "Failed to set withdrawal password.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

