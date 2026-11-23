import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
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

      if (!file) {
        return NextResponse.json(
          { error: "No image file provided." },
          { status: 400 }
        );
      }

      mimeType = file.type || "image/jpeg";
      if (!mimeType.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files (JPG, PNG, WEBP) are allowed." },
          { status: 400 }
        );
      }

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);

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

    // If Cloudinary credentials are provided, upload to Cloudinary CDN
    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await new Promise<{ secure_url: string }>(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "zexo_capital/avatars",
                public_id: `avatar_${userPayload.userId}_${Date.now()}`,
                transformation: [
                  { width: 400, height: 400, crop: "fill", gravity: "face" },
                  { quality: "auto" },
                  { fetch_format: "auto" },
                ],
              },
              (err, result) => {
                if (err || !result) reject(err || new Error("Cloudinary upload failed"));
                else resolve(result as { secure_url: string });
              }
            );
            stream.end(buffer);
          }
        );

        finalAvatarUrl = uploadResult.secure_url;
      } catch (cloudErr) {
        console.error("Cloudinary upload error, falling back to local storage:", cloudErr);
      }
    }

    // Local file fallback if Cloudinary is not configured or failed
    if (!finalAvatarUrl) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileName = `avatar_${userPayload.userId}_${Date.now()}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      finalAvatarUrl = `/uploads/avatars/${fileName}`;
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
