import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { GiftCode } from "@/models/GiftCode";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { code } = body;

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "Please enter the secret code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const gift = await GiftCode.findOne({ code: cleanCode, isActive: true });
    if (!gift) {
      return NextResponse.json(
        { error: "Invalid or expired secret code." },
        { status: 404 }
      );
    }

    if (gift.expiresAt && new Date() > gift.expiresAt) {
      return NextResponse.json(
        { error: "This secret code has expired." },
        { status: 400 }
      );
    }

    if (gift.usedCount >= gift.maxUses) {
      return NextResponse.json(
        { error: "This gift code has reached its maximum redemption limit." },
        { status: 400 }
      );
    }

    if (gift.usedByUsers.includes(userPayload.userId)) {
      return NextResponse.json(
        { error: "You have already claimed this gift code." },
        { status: 400 }
      );
    }

    // Redeem gift code
    gift.usedCount += 1;
    gift.usedByUsers.push(userPayload.userId);
    await gift.save();

    // Credit user balance
    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.balance = Number((user.balance + gift.amount).toFixed(4));
    await user.save();

    // Record transaction
    await Transaction.create({
      userId: user._id.toString(),
      type: "gift_received",
      title: `Gift received (${cleanCode})`,
      amount: gift.amount,
      status: "success",
      metadata: { code: cleanCode },
    });

    return NextResponse.json({
      success: true,
      message: `Congratulations! ${gift.amount} TK gift bonus received!`,
      amount: gift.amount,
      newBalance: user.balance,
    });
  } catch (error: unknown) {
    console.error("Gift Claim Error:", error);
    const message = error instanceof Error ? error.message : "Failed to claim gift reward.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

