import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const records = await Transaction.find({ userId: userPayload.userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, records });
  } catch (error: unknown) {
    console.error("Records Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch records.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
