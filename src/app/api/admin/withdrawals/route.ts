import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Withdrawal } from "@/models/Withdrawal";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
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

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, withdrawals });
  } catch (error: unknown) {
    console.error("Admin Get Withdrawals Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch withdrawals.";
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
    const { withdrawalId, action, adminNote } = body; // action: 'approve' | 'reject'

    if (!withdrawalId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid withdrawal ID or action." },
        { status: 400 }
      );
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found." },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        { error: `Withdrawal has already been ${withdrawal.status}.` },
        { status: 400 }
      );
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (action === "approve") {
      withdrawal.status = "approved";
      withdrawal.adminNote = adminNote || "Payout sent successfully";
      withdrawal.reviewedBy = admin.username;
      withdrawal.reviewedAt = new Date();
      await withdrawal.save();

      // Update corresponding transaction status to success
      await Transaction.findOneAndUpdate(
        { "metadata.withdrawalId": withdrawal._id.toString() },
        { status: "success" }
      );

      await Notification.create({
        userId: withdrawal.userId,
        title: "Withdrawal Paid Successfully",
        message: `Your withdrawal of ${withdrawal.amount} TK (Arrival: ${withdrawal.arrivalAmount} TK) to ${withdrawal.method} (${withdrawal.targetAccount}) has been approved and paid!`,
        type: "system",
        actionUrl: "/withdraw-record",
        actionText: "View Records",
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal of ${withdrawal.amount} TK (Arrival: ${withdrawal.arrivalAmount} TK) marked as Paid.`,
        withdrawal,
      });
    } else {
      // Reject -> Refund the money back to user balance!
      withdrawal.status = "rejected";
      withdrawal.adminNote = adminNote || "Rejected by admin";
      withdrawal.reviewedBy = admin.username;
      withdrawal.reviewedAt = new Date();
      await withdrawal.save();

      user.balance += withdrawal.amount;
      await user.save();

      // Update corresponding transaction status to failed
      await Transaction.findOneAndUpdate(
        { "metadata.withdrawalId": withdrawal._id.toString() },
        { status: "failed" }
      );

      await Notification.create({
        userId: withdrawal.userId,
        title: "Withdrawal Request Rejected",
        message: `Your withdrawal request of ${withdrawal.amount} TK (${withdrawal.method} - ${withdrawal.targetAccount}) was rejected by admin.\n\nReason: ${
          adminNote || "Account details mismatch or verification required"
        }.\n\nThe amount has been refunded back to your balance. Please check your account and apply again.`,
        type: "withdrawal_rejected",
        actionUrl: "/withdraw",
        actionText: "Re-apply Withdrawal",
      });

      return NextResponse.json({
        success: true,
        message: `Withdrawal rejected. ${withdrawal.amount} TK has been refunded to user balance.`,
        withdrawal,
      });
    }
  } catch (error: unknown) {
    console.error("Admin Update Withdrawal Error:", error);
    const message = error instanceof Error ? error.message : "Failed to update withdrawal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
