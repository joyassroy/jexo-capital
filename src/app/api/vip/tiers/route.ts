import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getActiveVipTiers } from "@/lib/vip";
import { Setting } from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const [tiers, settings] = await Promise.all([
      getActiveVipTiers(),
      Setting.findOne().lean(),
    ]);

    const usdtRate = settings?.usdtRateBDT || 127;
    const autoActiveEnabled = settings?.vipAutoActiveEnabled !== false;

    // Recalculate minUSDT and maxUSDT based on live USDT rate
    const liveTiers = tiers.map((t) => ({
      ...t,
      minUSDT: Number((t.minBDT / usdtRate).toFixed(2)),
      maxUSDT: Number((t.maxBDT / usdtRate).toFixed(2)),
    }));

    return NextResponse.json({
      success: true,
      tiers: liveTiers,
      autoActiveEnabled,
      usdtRate,
    });
  } catch (error: unknown) {
    console.error("Fetch VIP Tiers Error:", error);
    const message = error instanceof Error ? error.message : "Failed to load VIP tiers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
