import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { GiftCode } from "@/models/GiftCode";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const giftCodes = await GiftCode.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, giftCodes });
  } catch (error: unknown) {
    console.error("Admin Get Gift Codes Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch gift codes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { code, amount, maxUses, expiresAt } = body;

    if (!code || !amount) {
      return NextResponse.json(
        { error: "Please enter code name and reward amount." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await GiftCode.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { error: "This gift code already exists." },
        { status: 400 }
      );
    }

    const newGift = await GiftCode.create({
      code: cleanCode,
      amount: Number(amount),
      maxUses: Number(maxUses) || 1,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Gift code created successfully!",
      giftCode: newGift,
    });
  } catch (error: unknown) {
    console.error("Admin Create Gift Code Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create gift code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
