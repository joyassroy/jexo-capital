import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BankWallet } from "@/models/BankWallet";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const wallets = await BankWallet.find({ userId: userPayload.userId });
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

    if (!realName || !bankType) {
      return NextResponse.json(
        { error: "Please enter your real name and bank/wallet type." },
        { status: 400 }
      );
    }

    if (bankType === "USDT-BEP20") {
      if (!usdtAddress || usdtAddress.trim() === "") {
        return NextResponse.json(
          { error: "Please enter your USDT (BEP-20) address." },
          { status: 400 }
        );
      }
    } else {
      if (!accountNumber || accountNumber.trim() === "") {
        return NextResponse.json(
          { error: "Please enter your account number." },
          { status: 400 }
        );
      }
    }

    // Check if wallet already exists for this user and type
    const existingWallet = await BankWallet.findOne({
      userId: userPayload.userId,
      bankType,
    });

    if (existingWallet) {
      existingWallet.realName = realName.trim();
      existingWallet.accountNumber = accountNumber?.trim() || "";
      existingWallet.usdtAddress = usdtAddress?.trim() || "";
      await existingWallet.save();

      return NextResponse.json({
        success: true,
        message: "Wallet updated successfully!",
        wallet: existingWallet,
      });
    }

    const newWallet = await BankWallet.create({
      userId: userPayload.userId,
      realName: realName.trim(),
      bankType,
      accountNumber: accountNumber?.trim() || "",
      usdtAddress: usdtAddress?.trim() || "",
    });

    return NextResponse.json({
      success: true,
      message: "Wallet bound successfully!",
      wallet: newWallet,
    });
  } catch (error: unknown) {
    console.error("Save Wallet Error:", error);
    const message = error instanceof Error ? error.message : "Failed to save wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
