import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Deposit } from "@/models/Deposit";
import { Setting } from "@/models/Setting";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { amount, method, senderNumber, transferType, transactionId } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid deposit amount." },
        { status: 400 }
      );
    }

    if (!method || !["bKash", "Nagad", "USDT-BEP20"].includes(method)) {
      return NextResponse.json(
        { error: "Please select a valid payment method." },
        { status: 400 }
      );
    }

    if (!senderNumber || senderNumber.trim() === "") {
      return NextResponse.json(
        { error: "Please provide your sender account / address." },
        { status: 400 }
      );
    }

    if (!transactionId || transactionId.trim() === "") {
      return NextResponse.json(
        { error: "Please enter the Transaction ID (TxID)." },
        { status: 400 }
      );
    }

    const cleanTxId = transactionId.trim().toUpperCase();

    // Check if Transaction ID has already been submitted
    const existingTx = await Deposit.findOne({ transactionId: cleanTxId });
    if (existingTx) {
      return NextResponse.json(
        { error: "This Transaction ID has already been submitted." },
        { status: 400 }
      );
    }

    const setting = await Setting.findOne({ key: "default_settings" });
    const usdtRate = setting?.usdtRateBDT || 127;

    const depositAmount = Number(amount);
    const amountBDT =
      method === "USDT-BEP20" ? depositAmount * usdtRate : depositAmount;

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newDeposit = await Deposit.create({
      userId: user._id.toString(),
      userPhone: user.phone,
      userNickname: user.nickname,
      method,
      amount: depositAmount,
      amountBDT,
      senderNumber: senderNumber.trim(),
      transferType: transferType || "send_money",
      transactionId: cleanTxId,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message:
        "Recharge request submitted successfully! Your balance will be credited upon admin confirmation.",
      deposit: newDeposit,
    });
  } catch (error: unknown) {
    console.error("Deposit Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit deposit.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

