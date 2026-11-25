import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
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

    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let mimeType = "image/jpeg";
    let fileExtension = "jpg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const b64Data = formData.get("imageBase64") as string | null;

      if (file && typeof file === "object" && "size" in file && file.size > 0) {
        mimeType = file.type || "image/jpeg";
        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
      } else if (b64Data && b64Data.length > 20) {
        const matches = b64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
        } else {
          buffer = Buffer.from(b64Data, "base64");
        }
      }

      if (!buffer || buffer.length === 0) {
        return NextResponse.json(
          { error: "No image file provided." },
          { status: 400 }
        );
      }

      if (mimeType.includes("png")) fileExtension = "png";
      else if (mimeType.includes("webp")) fileExtension = "webp";
      else fileExtension = "jpg";
    } else {
      const body = await req.json().catch(() => ({}));
      const base64Data = body.image || body.imageBase64;
      if (!base64Data) {
        return NextResponse.json(
          { error: "Please provide an image." },
          { status: 400 }
        );
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
        if (mimeType.includes("png")) fileExtension = "png";
        else if (mimeType.includes("webp")) fileExtension = "webp";
        else fileExtension = "jpg";
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }
    }

    if (!buffer) {
      return NextResponse.json(
        { error: "Failed to process image file." },
        { status: 400 }
      );
    }

    let finalAvatarUrl = "";

    // Upload to Cloudinary CDN
    if (isCloudinaryConfigured) {
      try {
        finalAvatarUrl = await uploadImageBuffer(
          buffer,
          "zexo_capital/avatars",
          `avatar_${userPayload.userId}_${Date.now()}`,
          [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ]
        );
      } catch (cloudErr) {
        console.error("Cloudinary upload error, falling back to local or base64 storage:", cloudErr);
      }
    }

    // Local file fallback if Cloudinary is not configured or failed
    if (!finalAvatarUrl) {
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
        await fs.mkdir(uploadsDir, { recursive: true });

        const fileName = `avatar_${userPayload.userId}_${Date.now()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);
        await fs.writeFile(filePath, buffer);

        finalAvatarUrl = `/uploads/avatars/${fileName}`;
      } catch (fsErr) {
        console.warn("Local storage fallback failed (serverless read-only):", fsErr);
        const mime = fileExtension === "png" ? "image/png" : "image/jpeg";
        finalAvatarUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      }
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      userPayload.userId,
      { avatarUrl: finalAvatarUrl },
      { new: true }
    ).select("-passwordHash -withdrawPasswordHash");

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully!",
      avatarUrl: finalAvatarUrl,
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error("Avatar Upload Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload avatar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    await connectDB();
    await User.findByIdAndUpdate(userPayload.userId, { avatarUrl: "" });

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully.",
    });
  } catch (error: unknown) {
    console.error("Avatar Remove Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove avatar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
