import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { BankWallet } from "@/models/BankWallet";
import { Notification } from "@/models/Notification";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (type && type !== "all") {
      query.bankType = type;
    }

    const wallets = await BankWallet.find(query).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, wallets });
  } catch (error: unknown) {
    console.error("Admin Get Wallets Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch wallets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { walletId, action, rejectionReason } = body;

    if (!walletId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid wallet ID or action." },
        { status: 400 }
      );
    }

    const wallet = await BankWallet.findById(walletId);
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
    }

    if (action === "approve") {
      wallet.status = "approved";
      wallet.rejectionReason = undefined;
      wallet.reviewedBy = admin.username;
      wallet.reviewedAt = new Date();
      await wallet.save();

      // Send positive notification to user
      await Notification.create({
        userId: wallet.userId,
        title: `${wallet.bankType === "USDT-BEP20" ? "USDT (BEP-20) Address" : "Bank Card"} Verified`,
        message: `Your ${wallet.bankType} account (${
          wallet.bankType === "USDT-BEP20" ? wallet.usdtAddress : wallet.accountNumber
        }) has been approved and verified by admin. You can now use it for withdrawals.`,
        type: "wallet_approved",
        actionUrl: "/my-bank",
        actionText: "View My Bank",
      });

      return NextResponse.json({
        success: true,
        message: `${wallet.bankType} wallet approved successfully!`,
        wallet,
      });
    } else {
      // Reject action
      const reason =
        rejectionReason?.trim() ||
        (wallet.bankType === "USDT-BEP20"
          ? "Invalid or unverified BEP-20 address. Please provide a valid Binance Smart Chain BEP-20 address and re-apply."
          : "Account details verification failed. Please check your account number and name.");

      wallet.status = "rejected";
      wallet.rejectionReason = reason;
      wallet.reviewedBy = admin.username;
      wallet.reviewedAt = new Date();
      await wallet.save();

      // Send rejection notification to user with reason and re-apply link!
      await Notification.create({
        userId: wallet.userId,
        title: `${wallet.bankType === "USDT-BEP20" ? "USDT (BEP-20) Address" : "Bank Card"} Rejected`,
        message: `Your ${wallet.bankType} account (${
          wallet.bankType === "USDT-BEP20" ? wallet.usdtAddress : wallet.accountNumber
        }) was rejected by admin.\n\nReason: ${reason}\n\nPlease check your details and re-apply in 'My Bank'.`,
        type: "wallet_rejected",
        actionUrl: "/my-bank",
        actionText: "Re-apply Now",
      });

      return NextResponse.json({
        success: true,
        message: `${wallet.bankType} wallet rejected. Notification sent to user.`,
        wallet,
      });
    }
  } catch (error: unknown) {
    console.error("Admin Update Wallet Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
