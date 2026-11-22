import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = {};
    if (search.trim() !== "") {
      query.$or = [
        { phone: { $regex: search.trim(), $options: "i" } },
        { nickname: { $regex: search.trim(), $options: "i" } },
        { referralCode: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-passwordHash -withdrawPasswordHash")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    console.error("Admin Get Users Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { userId, balanceAdjustment, status, vipLevel } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (typeof balanceAdjustment === "number") {
      user.balance += balanceAdjustment;
    }

    if (status && ["active", "blocked"].includes(status)) {
      user.status = status;
    }

    if (typeof vipLevel === "number") {
      user.vipLevel = vipLevel;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error: unknown) {
    console.error("Admin Update User Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
