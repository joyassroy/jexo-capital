import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Kyc } from "@/models/Kyc";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    const kyc = await Kyc.findOne({ userId: userPayload.userId });
    return NextResponse.json({ success: true, kyc });
  } catch (error: unknown) {
    console.error("Get KYC Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch KYC.";
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
    const { realName, age, gender, nidNumber, frontPictureUrl, backPictureUrl } =
      body;

    if (!realName || !age || !gender || !nidNumber) {
      return NextResponse.json(
        { error: "Please provide all required personal information." },
        { status: 400 }
      );
    }

    if (age < 18 || age > 60) {
      return NextResponse.json(
        { error: "Age must be between 18 and 60 years." },
        { status: 400 }
      );
    }

    const existingKyc = await Kyc.findOne({ userId: userPayload.userId });
    if (existingKyc && existingKyc.status === "approved") {
      return NextResponse.json(
        { error: "Your identity has already been verified." },
        { status: 400 }
      );
    }

    if (existingKyc) {
      existingKyc.realName = realName.trim();
      existingKyc.age = Number(age);
      existingKyc.gender = gender;
      existingKyc.nidNumber = nidNumber.trim();
      existingKyc.frontPictureUrl = frontPictureUrl || "";
      existingKyc.backPictureUrl = backPictureUrl || "";
      existingKyc.status = "pending";
      await existingKyc.save();

      return NextResponse.json({
        success: true,
        message: "Personal information updated and submitted for review!",
        kyc: existingKyc,
      });
    }

    const newKyc = await Kyc.create({
      userId: userPayload.userId,
      realName: realName.trim(),
      age: Number(age),
      gender,
      nidNumber: nidNumber.trim(),
      frontPictureUrl: frontPictureUrl || "",
      backPictureUrl: backPictureUrl || "",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Personal information submitted successfully!",
      kyc: newKyc,
    });
  } catch (error: unknown) {
    console.error("KYC Submit Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit KYC.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
