import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { syncUserVipWithBalance } from "@/lib/vip";

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

    const [rawUsers, setting] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).lean(),
      Setting.findOne({ key: "default_settings" }).lean(),
    ]);

    const usdtRate = setting?.usdtRateBDT || 127;

    const users = rawUsers.map((u) => {
      const { passwordHash: _p, withdrawPasswordHash, ...rest } = u;
      return {
        ...rest,
        hasWithdrawPassword: Boolean(withdrawPasswordHash),
      };
    });

    return NextResponse.json({ success: true, users, usdtRate });
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
    const {
      userId,
      balanceAdjustment,
      status,
      vipLevel,
      newPassword,
      newWithdrawPassword,
    } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (typeof balanceAdjustment === "number") {
      user.balance = Math.max(
        0,
        Number((user.balance + balanceAdjustment).toFixed(4))
      );
    }

    if (status && ["active", "blocked"].includes(status)) {
      user.status = status;
    }

    if (typeof newPassword === "string" && newPassword.trim() !== "") {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "Login password must be at least 6 characters." },
          { status: 400 }
        );
      }
      user.passwordHash = await hashPassword(newPassword.trim());
      user.plainPassword = newPassword.trim();
    }

    if (typeof newWithdrawPassword === "string" && newWithdrawPassword.trim() !== "") {
      if (newWithdrawPassword.trim().length < 4) {
        return NextResponse.json(
          { error: "Withdrawal password must be at least 4 characters." },
          { status: 400 }
        );
      }
      user.withdrawPasswordHash = await hashPassword(newWithdrawPassword.trim());
      user.plainWithdrawPassword = newWithdrawPassword.trim();
    }

    if (typeof vipLevel === "number") {
      user.vipLevel = vipLevel;
    } else if (typeof balanceAdjustment === "number") {
      // Auto-sync VIP level with new balance
      await syncUserVipWithBalance(user);
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
