import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/models/Setting";
import { ensureDbInitialized } from "@/lib/init-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    await connectDB();

    let setting = await Setting.findOne({ key: "default_settings" });
    if (!setting) {
      setting = await Setting.create({ key: "default_settings" });
    }

    return NextResponse.json({
      success: true,
      settings: {
        bkashNumber: setting.bkashNumber,
        bkashType: setting.bkashType,
        nagadNumber: setting.nagadNumber,
        nagadType: setting.nagadType,
        usdtBep20Address: setting.usdtBep20Address,
        usdtRateBDT: setting.usdtRateBDT,
        usdtQrCodeUrl: setting.usdtQrCodeUrl || "",
        usdtNetworkName: setting.usdtNetworkName || "BEP-20 (BNB Smart Chain)",
        usdtDepositInstructions: setting.usdtDepositInstructions || "",
        whatsappNumber: setting.whatsappNumber,
        whatsappUrl: setting.whatsappUrl,
        telegramGroupUrl: setting.telegramGroupUrl,
        telegramChannelUrl: setting.telegramChannelUrl,
        homeTickerText: setting.homeTickerText,
        noticeItems: setting.noticeItems,
        minWithdrawBDT: setting.minWithdrawBDT,
        minWithdrawUSDT: setting.minWithdrawUSDT,
        withdrawFeePercent: setting.withdrawFeePercent,
        withdrawStartTime: setting.withdrawStartTime,
        withdrawEndTime: setting.withdrawEndTime,
        withdrawAllowedDays: setting.withdrawAllowedDays,
      },
    });
  } catch (error: unknown) {
    console.error("Get Settings Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
