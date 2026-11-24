import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BankWallet } from "@/models/BankWallet";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    // Auto-approve and lock any previously pending wallets
    await BankWallet.updateMany(
      { userId: userPayload.userId, status: "pending" },
      { $set: { status: "approved", isLocked: true } }
    );

    const wallets = await BankWallet.find({ userId: userPayload.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, wallets });
  } catch (error: unknown) {
    console.error("Get Wallets Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch wallets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { realName, bankType, accountNumber, usdtAddress } = body;

    if (!realName || !realName.trim()) {
      return NextResponse.json(
        { error: "Please enter your real name." },
        { status: 400 }
      );
    }

    if (!bankType || !["bKash", "Nagad", "USDT-BEP20"].includes(bankType)) {
      return NextResponse.json(
        { error: "Please select a valid wallet type (bKash, Nagad, or USDT-BEP20)." },
        { status: 400 }
      );
    }

    const cleanUsdt = usdtAddress ? usdtAddress.trim() : "";
    const cleanAccount = accountNumber ? accountNumber.trim() : "";

    if (bankType === "USDT-BEP20") {
      if (!cleanUsdt) {
        return NextResponse.json(
          { error: "Please enter your USDT (BEP-20) address." },
          { status: 400 }
        );
      }
      // BEP-20 address regex check: starts with 0x followed by 40 hexadecimal characters
      const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
      if (!bep20Regex.test(cleanUsdt)) {
        return NextResponse.json(
          {
            error:
              "Invalid USDT (BEP-20) address. It must start with 0x followed by 40 hex characters (e.g. 0x8f83d56dac8403238181a32f4e766d68529d9cad).",
          },
          { status: 400 }
        );
      }
    } else {
      if (!cleanAccount) {
        return NextResponse.json(
          { error: "Please enter your account number." },
          { status: 400 }
        );
      }
    }

    // Fetch user details for phone & nickname
    const user = await User.findById(userPayload.userId);

    // One-Time Edit Rule: Check if wallet is already bound for this category
    const isBankCategory = bankType === "bKash" || bankType === "Nagad";
    const existingWallet = await BankWallet.findOne({
      userId: userPayload.userId,
      bankType: isBankCategory ? { $in: ["bKash", "Nagad"] } : "USDT-BEP20",
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          error:
            "Your account is already bound and locked. You can only set your account details once. To modify or add a new account, please contact Customer Service / Admin for permission.",
        },
        { status: 403 }
      );
    }

    const newWallet = await BankWallet.create({
      userId: userPayload.userId,
      userPhone: user?.phone || "",
      userNickname: user?.nickname || "",
      realName: realName.trim(),
      bankType,
      accountNumber: cleanAccount,
      usdtAddress: cleanUsdt,
      status: "approved",
      isLocked: true,
    });

    return NextResponse.json({
      success: true,
      message: "Account bound successfully and securely locked!",
      wallet: newWallet,
    });
  } catch (error: unknown) {
    console.error("Save Wallet Error:", error);
    const message = error instanceof Error ? error.message : "Failed to save wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
