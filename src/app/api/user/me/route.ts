import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Kyc } from "@/models/Kyc";
import { BankWallet } from "@/models/BankWallet";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json(
        { error: "Unauthenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userPayload.userId).select(
      "-passwordHash -withdrawPasswordHash"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check KYC status
    const kyc = await Kyc.findOne({ userId: user._id.toString() });

    // Check Bank / Wallets
    const wallets = await BankWallet.find({ userId: user._id.toString() });

    return NextResponse.json({
      success: true,
      user,
      hasWithdrawPassword: Boolean(userPayload.userId), // or check user document
      kycStatus: kyc ? kyc.status : "not_submitted",
      wallets,
    });
  } catch (error: unknown) {
    console.error("User Fetch Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch user data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
