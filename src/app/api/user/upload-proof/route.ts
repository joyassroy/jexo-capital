import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import cloudinary, { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let fileExtension = "jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const mimeType = file.type || "image/jpeg";
      if (!mimeType.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files (PNG, JPG, WEBP) are allowed" },
          { status: 400 }
        );
      }

      if (mimeType.includes("png")) fileExtension = "png";
      else if (mimeType.includes("webp")) fileExtension = "webp";
      else if (mimeType.includes("gif")) fileExtension = "gif";
      else fileExtension = "jpg";

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } else {
      const body = await req.json().catch(() => ({}));
      const base64Data = body.image || body.imageBase64 || body.proofImage;
      if (!base64Data) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
        if (mimeType.includes("png")) fileExtension = "png";
        else if (mimeType.includes("webp")) fileExtension = "webp";
        else fileExtension = "jpg";
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }
    }

    if (!buffer) {
      return NextResponse.json({ error: "Failed to process image file." }, { status: 400 });
    }

    // Limit image size to 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size exceeds 10MB limit." }, { status: 400 });
    }

    let finalProofUrl = "";

    // Upload to Cloudinary CDN
    if (isCloudinaryConfigured) {
      try {
        finalProofUrl = await uploadImageBuffer(
          buffer,
          "zexo_capital/deposits",
          `proof_${userPayload.userId}_${Date.now()}`,
          [
            { width: 1200, height: 1600, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ]
        );
      } catch (cloudErr) {
        console.error("Cloudinary upload error, falling back to local or base64 storage:", cloudErr);
      }
    }

    // Local file fallback if Cloudinary is not configured or failed
    if (!finalProofUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "deposits");
        await fs.mkdir(uploadsDir, { recursive: true });

        const fileName = `proof_${userPayload.userId}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);
        await fs.writeFile(filePath, buffer);

        finalProofUrl = `/uploads/deposits/${fileName}`;
      } catch (fsErr) {
        console.warn("Local storage fallback failed (serverless read-only):", fsErr);
        const mime = fileExtension === "png" ? "image/png" : "image/jpeg";
        finalProofUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    }

    return NextResponse.json({
      success: true,
      proofUrl: finalProofUrl,
    });
  } catch (error: unknown) {
    console.error("Proof Upload Error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload proof.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
