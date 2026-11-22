import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Deposit } from "@/models/Deposit";
import { Withdrawal } from "@/models/Withdrawal";
import { Kyc } from "@/models/Kyc";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalUsers,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      pendingKycCount,
      approvedDeposits,
      approvedWithdrawals,
      userBalances,
    ] = await Promise.all([
      User.countDocuments(),
      Deposit.countDocuments({ status: "pending" }),
      Withdrawal.countDocuments({ status: "pending" }),
      Kyc.countDocuments({ status: "pending" }),
      Deposit.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amountBDT" } } },
      ]),
      Withdrawal.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]),
    ]);

    const totalDepositAmount = approvedDeposits[0]?.total || 0;
    const totalWithdrawalAmount = approvedWithdrawals[0]?.total || 0;
    const totalUserBalance = userBalances[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        pendingKycCount,
        totalDepositAmount,
        totalWithdrawalAmount,
        totalUserBalance,
      },
    });
  } catch (error: unknown) {
    console.error("Admin Stats Error:", error);
    const message = error instanceof Error ? error.message : "Failed to load stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
