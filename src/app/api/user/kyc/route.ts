import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Kyc } from "@/models/Kyc";
import { getCurrentUser } from "@/lib/auth";
import { uploadImageBuffer, isCloudinaryConfigured } from "@/lib/cloudinary";
import path from "path";
import fs from "fs/promises";

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

// Helper to save buffer to local public uploads as fallback
async function saveLocalFallback(
  buffer: Buffer,
  prefix: string,
  userId: string,
  extension: string
): Promise<string> {
  const filename = `${prefix}_${userId}_${Date.now()}.${extension}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "kyc");
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/kyc/${filename}`;
}

// Helper to upload a single image (from File or base64) to Cloudinary or fallback
async function processAndUploadImage(
  imageInput: File | string | null,
  prefix: string,
  userId: string
): Promise<string | null> {
  if (!imageInput) return null;

  let buffer: Buffer | null = null;
  let extension = "jpg";

  if (typeof imageInput === "object" && "arrayBuffer" in imageInput) {
    const file = imageInput as File;
    const mime = file.type || "image/jpeg";
    if (mime.includes("png")) extension = "png";
    else if (mime.includes("webp")) extension = "webp";
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } else if (typeof imageInput === "string") {
    // If it's already an http/https URL, return it directly
    if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
      return imageInput;
    }
    // Check base64
    const matches = imageInput.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes("png")) extension = "png";
      else if (mime.includes("webp")) extension = "webp";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(imageInput, "base64");
    }
  }

  if (!buffer || buffer.length === 0) return null;

  // Try Cloudinary first
  if (isCloudinaryConfigured) {
    try {
      const publicId = `${prefix}_${userId}_${Date.now()}`;
      const url = await uploadImageBuffer(
        buffer,
        "zexo_capital/kyc",
        publicId,
        [{ quality: "auto" }, { fetch_format: "auto" }]
      );
      if (url) return url;
    } catch (cErr) {
      console.warn("Cloudinary upload failed for KYC image, saving locally:", cErr);
    }
  }

  // Fallback to local disk
  try {
    return await saveLocalFallback(buffer, prefix, userId, extension);
  } catch (fsErr) {
    console.error("Local fallback save failed:", fsErr);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let realName = "";
    let age = 0;
    let gender = "Male";
    let nidNumber = "";
    let frontPictureInput: File | string | null = null;
    let backPictureInput: File | string | null = null;
    let existingFrontUrl = "";
    let existingBackUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      realName = String(formData.get("realName") || "").trim();
      age = Number(formData.get("age") || 0);
      gender = String(formData.get("gender") || "Male");
      nidNumber = String(formData.get("nidNumber") || "").trim();

      const frontFile = formData.get("frontPicture") as File | null;
      const backFile = formData.get("backPicture") as File | null;
      if (frontFile && frontFile.size > 0) frontPictureInput = frontFile;
      if (backFile && backFile.size > 0) backPictureInput = backFile;

      existingFrontUrl = String(formData.get("frontPictureUrl") || "");
      existingBackUrl = String(formData.get("backPictureUrl") || "");
    } else {
      const body = await req.json().catch(() => ({}));
      realName = String(body.realName || "").trim();
      age = Number(body.age || 0);
      gender = String(body.gender || "Male");
      nidNumber = String(body.nidNumber || "").trim();
      frontPictureInput = body.frontPicture || body.frontPictureBase64 || null;
      backPictureInput = body.backPicture || body.backPictureBase64 || null;
      existingFrontUrl = String(body.frontPictureUrl || "");
      existingBackUrl = String(body.backPictureUrl || "");
    }

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
        { error: "Your identity has already been verified and approved." },
        { status: 400 }
      );
    }

    // Process and upload front image
    let finalFrontUrl = existingFrontUrl || existingKyc?.frontPictureUrl || "";
    if (frontPictureInput) {
      const uploadedFront = await processAndUploadImage(
        frontPictureInput,
        "nid_front",
        userPayload.userId
      );
      if (uploadedFront) finalFrontUrl = uploadedFront;
    }

    // Process and upload back image
    let finalBackUrl = existingBackUrl || existingKyc?.backPictureUrl || "";
    if (backPictureInput) {
      const uploadedBack = await processAndUploadImage(
        backPictureInput,
        "nid_back",
        userPayload.userId
      );
      if (uploadedBack) finalBackUrl = uploadedBack;
    }

    if (!finalFrontUrl) {
      return NextResponse.json(
        { error: "Please upload the Front picture of your National ID." },
        { status: 400 }
      );
    }

    if (!finalBackUrl) {
      return NextResponse.json(
        { error: "Please upload the Back picture of your National ID." },
        { status: 400 }
      );
    }

    if (existingKyc) {
      existingKyc.realName = realName;
      existingKyc.age = age;
      existingKyc.gender = gender;
      existingKyc.nidNumber = nidNumber;
      existingKyc.frontPictureUrl = finalFrontUrl;
      existingKyc.backPictureUrl = finalBackUrl;
      existingKyc.status = "pending";
      existingKyc.adminNote = undefined;
      await existingKyc.save();

      return NextResponse.json({
        success: true,
        message: "National ID documents submitted successfully to Cloudinary for review!",
        kyc: existingKyc,
      });
    }

    const newKyc = await Kyc.create({
      userId: userPayload.userId,
      realName,
      age,
      gender,
      nidNumber,
      frontPictureUrl: finalFrontUrl,
      backPictureUrl: finalBackUrl,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "National ID documents submitted successfully to Cloudinary for review!",
      kyc: newKyc,
    });
  } catch (error: unknown) {
    console.error("KYC Submit Error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit KYC.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
