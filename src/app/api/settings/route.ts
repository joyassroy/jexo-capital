import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Setting } from "@/models/Setting";
import { ensureDbInitialized } from "@/lib/init-db";
import {
  normalizeGatewayAccounts,
  selectNextGatewayAccount,
} from "@/lib/gateway-rotation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    await connectDB();

    let setting = await Setting.findOne({ key: "default_settings" });
    if (!setting) {
      setting = await Setting.create({ key: "default_settings" });
    }

    // Normalize & auto-reset daily usage if a new day started in Bangladesh
    const normBkash = normalizeGatewayAccounts(
      setting.bkashAccounts,
      setting.bkashNumber,
      setting.bkashType
    );
    const normNagad = normalizeGatewayAccounts(
      setting.nagadAccounts,
      setting.nagadNumber,
      setting.nagadType
    );

    const bkashSelection = selectNextGatewayAccount(
      normBkash.accounts,
      setting.bkashRotationIndex || 0
    );
    const nagadSelection = selectNextGatewayAccount(
      normNagad.accounts,
      setting.nagadRotationIndex || 0
    );

    if (normBkash.changed) setting.bkashAccounts = normBkash.accounts;
    if (normNagad.changed) setting.nagadAccounts = normNagad.accounts;
    setting.bkashRotationIndex = bkashSelection.nextRotationIndex;
    setting.nagadRotationIndex = nagadSelection.nextRotationIndex;
    await setting.save();

    const activeBkashNumber =
      bkashSelection.selected?.number || setting.bkashNumber;
    const activeBkashType =
      bkashSelection.selected?.type || setting.bkashType;
    const activeNagadNumber =
      nagadSelection.selected?.number || setting.nagadNumber;
    const activeNagadType =
      nagadSelection.selected?.type || setting.nagadType;

    return NextResponse.json({
      success: true,
      settings: {
        bkashNumber: activeBkashNumber,
        bkashType: activeBkashType,
        bkashAccounts: bkashSelection.availableAccounts.map((a) => ({
          number: a.number,
          type: a.type,
          dailyLimitBDT: a.dailyLimitBDT,
          usedTodayBDT: a.usedTodayBDT,
        })),
        nagadNumber: activeNagadNumber,
        nagadType: activeNagadType,
        nagadAccounts: nagadSelection.availableAccounts.map((a) => ({
          number: a.number,
          type: a.type,
          dailyLimitBDT: a.dailyLimitBDT,
          usedTodayBDT: a.usedTodayBDT,
        })),
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
        homeBanner1: setting.homeBanner1 || "/homepage-banner.jpg",
        homeBanner2: setting.homeBanner2 || "/homepage-banner-2.jpg",
        profileBanner: setting.profileBanner || "/profile-banner-hq.jpg",
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
