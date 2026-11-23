import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
  publicId?: string,
  transformation?: Record<string, unknown>[]
): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder,
      resource_type: "image",
    };
    if (publicId) options.public_id = publicId;
    if (transformation) options.transformation = transformation;

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error || new Error("Cloudinary upload failed"));
      } else {
        resolve(result.secure_url);
      }
    });

    stream.end(buffer);
  });
}

export default cloudinary;
