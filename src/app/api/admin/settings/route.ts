import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/models/Setting";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let setting = await Setting.findOne({ key: "default_settings" });
    if (!setting) {
      setting = await Setting.create({ key: "default_settings" });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: unknown) {
    console.error("Admin Get Settings Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch settings.";
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

    let setting = await Setting.findOne({ key: "default_settings" });
    if (!setting) {
      setting = new Setting({ key: "default_settings" });
    }

    // Update fields
    if (body.bkashNumber !== undefined) setting.bkashNumber = body.bkashNumber;
    if (body.bkashType !== undefined) setting.bkashType = body.bkashType;
    if (body.nagadNumber !== undefined) setting.nagadNumber = body.nagadNumber;
    if (body.nagadType !== undefined) setting.nagadType = body.nagadType;
    if (body.usdtBep20Address !== undefined) setting.usdtBep20Address = body.usdtBep20Address;
    if (body.usdtRateBDT !== undefined) setting.usdtRateBDT = Number(body.usdtRateBDT);
    if (body.whatsappNumber !== undefined) setting.whatsappNumber = body.whatsappNumber;
    if (body.whatsappUrl !== undefined) setting.whatsappUrl = body.whatsappUrl;
    if (body.telegramGroupUrl !== undefined) setting.telegramGroupUrl = body.telegramGroupUrl;
    if (body.telegramChannelUrl !== undefined) setting.telegramChannelUrl = body.telegramChannelUrl;
    if (body.homeTickerText !== undefined) setting.homeTickerText = body.homeTickerText;
    if (body.minWithdrawBDT !== undefined) setting.minWithdrawBDT = Number(body.minWithdrawBDT);
    if (body.minWithdrawUSDT !== undefined) setting.minWithdrawUSDT = Number(body.minWithdrawUSDT);
    if (body.withdrawFeePercent !== undefined) setting.withdrawFeePercent = Number(body.withdrawFeePercent);
    if (body.withdrawStartTime !== undefined) setting.withdrawStartTime = body.withdrawStartTime;
    if (body.withdrawEndTime !== undefined) setting.withdrawEndTime = body.withdrawEndTime;

    await setting.save();

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully!",
      setting,
    });
  } catch (error: unknown) {
    console.error("Admin Put Settings Error:", error);
    const message = error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
