"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadGiftImage(formData: FormData) {
  const file = formData.get("image") as File | null;
  const name = formData.get("name") as string;

  if (!file) {
    throw new Error("No image selected");
  }

  // Convert file → buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload
  const uploaded = await cloudinary.uploader.upload_stream({
    folder: "gifts",
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gifts" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ ...result, name });
      }
    );
    stream.end(buffer);
  });
}
