import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Kyc } from "@/models/Kyc";
import { User } from "@/models/User";
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

    const kycs = await Kyc.find(query).sort({ createdAt: -1 }).lean();

    // Attach user phone and nickname to each record
    const kycsWithUser = await Promise.all(
      kycs.map(async (item) => {
        const user = await User.findById(item.userId).select("phone nickname").lean();
        return {
          ...item,
          userPhone: user?.phone || "N/A",
          userNickname: user?.nickname || "N/A",
        };
      })
    );

    return NextResponse.json({ success: true, kycs: kycsWithUser });
  } catch (error: unknown) {
    console.error("Admin Get KYC Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch KYC submissions.";
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
    const { kycId, action, adminNote } = body; // action: 'approve' | 'reject'

    if (!kycId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid KYC ID or action." },
        { status: 400 }
      );
    }

    const kyc = await Kyc.findById(kycId);
    if (!kyc) {
      return NextResponse.json({ error: "KYC submission not found." }, { status: 404 });
    }

    kyc.status = action === "approve" ? "approved" : "rejected";
    kyc.reviewedAt = new Date();
    if (adminNote) {
      kyc.adminNote = adminNote;
    }
    await kyc.save();

    return NextResponse.json({
      success: true,
      message: `KYC submission successfully ${kyc.status}!`,
      kyc,
    });
  } catch (error: unknown) {
    console.error("Admin Review KYC Error:", error);
    const message = error instanceof Error ? error.message : "Failed to review KYC.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

