import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { VipTier } from "@/models/VipTier";
import { Setting } from "@/models/Setting";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllVipTiersAdmin } from "@/lib/vip";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const [tiers, settings] = await Promise.all([
      getAllVipTiersAdmin(),
      Setting.findOne().lean(),
    ]);

    const usdtRate = settings?.usdtRateBDT || 127;
    const vipAutoActiveEnabled = settings?.vipAutoActiveEnabled !== false;

    return NextResponse.json({
      success: true,
      tiers,
      vipAutoActiveEnabled,
      usdtRate,
    });
  } catch (error: unknown) {
    console.error("Admin Get VIP Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch VIP tiers.";
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

    const level = Number(body.level);
    if (isNaN(level) || level < 0) {
      return NextResponse.json(
        { error: "A valid VIP level number (0 or higher) is required." },
        { status: 400 }
      );
    }

    // Check if level already exists
    const existing = await VipTier.findOne({ level });
    if (existing) {
      return NextResponse.json(
        { error: `VIP Level ${level} already exists.` },
        { status: 400 }
      );
    }

    const minBDT = typeof body.minBDT === "number" ? body.minBDT : Number(body.minBDT) || 0;
    const maxBDT = typeof body.maxBDT === "number" ? body.maxBDT : Number(body.maxBDT) || 2999;
    const dailyReturnPercent = Number(body.dailyReturnPercent) || 5.0;
    const commissionPerOrderPercent = Number(body.commissionPerOrderPercent) || 0.5;
    const numberOfOrders = Number(body.numberOfOrders) || 5;

    const settings = await Setting.findOne().lean();
    const usdtRate = settings?.usdtRateBDT || 127;

    const newTier = await VipTier.create({
      level,
      name: body.name?.trim() || `Vip-${level}`,
      dailyReturn: `${dailyReturnPercent.toFixed(2)}%`,
      dailyReturnPercent,
      numberOfOrders,
      commissionPerOrder: `${commissionPerOrderPercent.toFixed(2)}%`,
      commissionPerOrderPercent,
      minBDT,
      maxBDT,
      minUSDT: Number((minBDT / usdtRate).toFixed(2)),
      maxUSDT: Number((maxBDT / usdtRate).toFixed(2)),
      status: body.status === "inactive" ? "inactive" : "active",
      order: level,
    });

    return NextResponse.json({
      success: true,
      message: `VIP-${level} created successfully!`,
      tier: newTier,
    });
  } catch (error: unknown) {
    console.error("Admin Create VIP Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create VIP tier.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // If updating global VIP setting (auto active toggle)
    if (typeof body.vipAutoActiveEnabled === "boolean") {
      let setting = await Setting.findOne({ key: "default_settings" });
      if (!setting) {
        setting = await Setting.create({ key: "default_settings" });
      }
      setting.vipAutoActiveEnabled = body.vipAutoActiveEnabled;
      await setting.save();

      return NextResponse.json({
        success: true,
        message: `VIP Auto-activation ${body.vipAutoActiveEnabled ? "enabled" : "disabled"} successfully.`,
        vipAutoActiveEnabled: setting.vipAutoActiveEnabled,
      });
    }

    // Otherwise updating a specific tier
    const tierId = body._id || body.id;
    if (!tierId) {
      return NextResponse.json({ error: "Tier ID is required." }, { status: 400 });
    }

    const tier = await VipTier.findById(tierId);
    if (!tier) {
      return NextResponse.json({ error: "VIP tier not found." }, { status: 404 });
    }

    const settings = await Setting.findOne().lean();
    const usdtRate = settings?.usdtRateBDT || 127;

    if (body.name) tier.name = body.name.trim();
    if (typeof body.level === "number" && body.level >= 0) tier.level = body.level;
    if (typeof body.dailyReturnPercent === "number") {
      tier.dailyReturnPercent = body.dailyReturnPercent;
      tier.dailyReturn = `${body.dailyReturnPercent.toFixed(2)}%`;
    }
    if (typeof body.numberOfOrders === "number") {
      tier.numberOfOrders = body.numberOfOrders;
    }
    if (typeof body.commissionPerOrderPercent === "number") {
      tier.commissionPerOrderPercent = body.commissionPerOrderPercent;
      tier.commissionPerOrder = `${body.commissionPerOrderPercent.toFixed(2)}%`;
    }
    if (typeof body.minBDT === "number") {
      tier.minBDT = body.minBDT;
      tier.minUSDT = Number((body.minBDT / usdtRate).toFixed(2));
    }
    if (typeof body.maxBDT === "number") {
      tier.maxBDT = body.maxBDT;
      tier.maxUSDT = Number((body.maxBDT / usdtRate).toFixed(2));
    }
    if (body.status && ["active", "inactive"].includes(body.status)) {
      tier.status = body.status;
    }

    await tier.save();

    return NextResponse.json({
      success: true,
      message: `${tier.name} updated successfully!`,
      tier,
    });
  } catch (error: unknown) {
    console.error("Admin Update VIP Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update VIP tier.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tier ID is required." }, { status: 400 });
    }

    const tier = await VipTier.findById(id);
    if (!tier) {
      return NextResponse.json({ error: "VIP Tier not found." }, { status: 404 });
    }

    await VipTier.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `${tier.name} (Level ${tier.level}) deleted successfully!`,
    });
  } catch (error: unknown) {
    console.error("Admin Delete VIP Error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete VIP tier.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
