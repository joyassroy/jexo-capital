import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let fileExtension = "png";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const mimeType = file.type || "image/png";
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
      const base64Data = body.image || body.imageBase64;
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

    let finalUrl = "";

    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "zexo_capital/admin",
              public_id: `qr_${Date.now()}`,
              quality: "auto",
              fetch_format: "auto",
            },
            (err, result) => {
              if (err || !result) reject(err || new Error("Cloudinary upload failed"));
              else resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        });
        finalUrl = uploadResult.secure_url;
      } catch (e) {
        console.error("Cloudinary failed, falling back to local storage:", e);
      }
    }

    if (!finalUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "admin");
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `qr_${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      finalUrl = `/uploads/admin/${filename}`;
    }

    return NextResponse.json({ success: true, url: finalUrl });
  } catch (error: unknown) {
    console.error("Admin upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
