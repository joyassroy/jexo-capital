import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import cloudinary, { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";
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
    let prefix = "file";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const customPrefix = formData.get("prefix") as string | null;
      if (customPrefix) {
        prefix = customPrefix.replace(/[^a-zA-Z0-9_-]/g, "");
      }
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

    // Upload to Cloudinary CDN
    if (isCloudinaryConfigured) {
      try {
        finalUrl = await uploadImageBuffer(
          buffer,
          "zexo_capital/admin",
          `${prefix}_${Date.now()}`,
          [
            { quality: "auto" },
            { fetch_format: "auto" },
          ]
        );
      } catch (e) {
        console.error("Cloudinary upload error, falling back to local or base64 storage:", e);
      }
    }

    if (!finalUrl) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "admin");
        await fs.mkdir(uploadDir, { recursive: true });
        const filename = `${prefix}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadDir, filename);
        await fs.writeFile(filePath, buffer);
        finalUrl = `/uploads/admin/${filename}`;
      } catch (fsErr) {
        console.warn("Local storage fallback failed (serverless read-only):", fsErr);
        const mime = fileExtension === "png" ? "image/png" : "image/jpeg";
        finalUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    }

    return NextResponse.json({ success: true, url: finalUrl });
  } catch (error: unknown) {
    console.error("Admin upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
