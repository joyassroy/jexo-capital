import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Deposit } from "@/models/Deposit";
import { Setting } from "@/models/Setting";
import { Kyc } from "@/models/Kyc";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    // Verify that profile and NID documents are completed before allowing deposit
    const kyc = await Kyc.findOne({ userId: userPayload.userId });
    if (!kyc || !kyc.nidNumber || !kyc.frontPictureUrl || !kyc.backPictureUrl) {
      return NextResponse.json(
        {
          error: "Please complete your profile and submit your National ID (NID) photos first.",
          requireKyc: true,
        },
        { status: 400 }
      );
    }
    if (kyc.status === "rejected") {
      return NextResponse.json(
        {
          error: "Your NID verification was rejected. Please re-submit your NID photos in Profile.",
          requireKyc: true,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { amount, method, senderNumber, transferType, transactionId, proofImage } = body;

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

    const effectiveSender =
      senderNumber && senderNumber.trim() !== ""
        ? senderNumber.trim()
        : method === "USDT-BEP20"
        ? (userPayload.phone || "USDT-Wallet")
        : "";

    if (!effectiveSender) {
      return NextResponse.json(
        { error: "Please provide your sender account / address." },
        { status: 400 }
      );
    }

    let cleanTxId = transactionId && transactionId.trim() !== "" ? transactionId.trim().toUpperCase() : "";

    if (method === "USDT-BEP20") {
      if (!cleanTxId) {
        cleanTxId = `BEP20-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      if (!cleanTxId) {
        return NextResponse.json(
          { error: "Please enter the Transaction ID (TxID)." },
          { status: 400 }
        );
      }
    }

    // Check if Transaction ID has already been submitted (for manually entered TxID)
    if (transactionId && transactionId.trim() !== "") {
      const existingTx = await Deposit.findOne({ transactionId: cleanTxId });
      if (existingTx) {
        return NextResponse.json(
          { error: "This Transaction ID has already been submitted." },
          { status: 400 }
        );
      }
    }

    const setting = await Setting.findOne({ key: "default_settings" });
    const usdtRate = setting?.usdtRateBDT || 127;

    const depositAmount = Number(amount);
    let amountBDT = 0;
    let amountUSDT = 0;

    if (method === "USDT-BEP20") {
      amountUSDT = depositAmount;
      amountBDT = Number((depositAmount * usdtRate).toFixed(2));
    } else {
      // Local mobile bank: user sent BDT via bKash/Nagad
      amountBDT = depositAmount;
      amountUSDT = Number((depositAmount / usdtRate).toFixed(4));
    }

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
      amountUSDT,
      senderNumber: effectiveSender,
      transferType: transferType || "send_money",
      transactionId: cleanTxId,
      proofImage: proofImage || "",
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

