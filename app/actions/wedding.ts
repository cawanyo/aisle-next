"use server";

import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

// Helper: Reusable upload function
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    );
    stream.end(buffer);
  });
}

// --- Action: Save Wedding Details ---
export async function saveWeddingDetails(prevState: any, formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const groomName = formData.get("groomName") as string;
  const brideName = formData.get("brideName") as string;
  const location = formData.get("location") as string;
  const dateStr = formData.get("date") as string;
  
  // File handling
  const coverFile = formData.get("coverImage") as File | null;
  const galleryFiles = formData.getAll("galleryImages") as File[]; // Get all selected files

  if (!projectId) return { message: "Project ID missing" };

  const deletedIdsJson = formData.get("deletedImageIds") as string;
  let deletedImageIds: string[] = [];

  try {
    deletedImageIds = deletedIdsJson ? JSON.parse(deletedIdsJson) : [];
  } catch (e) {
    console.error("Failed to parse deleted image IDs");
  }

  try {

    if (deletedImageIds.length > 0) {
      await prisma.weddingGalleryImage.deleteMany({
        where: {
          id: { in: deletedImageIds },
          // Security check: ensure these images belong to this project's wedding
          weddingDetails: { projectId: projectId } 
        }
      });
      
    }
    // 1. Handle Cover Image Upload
    let coverImageUrl = undefined;
    if (coverFile && coverFile.size > 0) {
      coverImageUrl = await uploadToCloudinary(coverFile, "wedding-covers");
    }

    // 2. Handle Gallery Uploads (Parallel Uploads)
    const newGalleryImageUrls: string[] = [];
    if (galleryFiles.length > 0) {
      const uploadPromises = galleryFiles.map((file) => {
        if (file.size > 0) return uploadToCloudinary(file, "wedding-gallery");
        return null;
      });
      
      const results = await Promise.all(uploadPromises);
      results.forEach(url => { if (url) newGalleryImageUrls.push(url); });
    }

    // 3. Save to Database (Upsert: Create if not exists, Update if exists)
    await prisma.weddingDetails.upsert({
      where: { projectId },
      update: {
        groomName,
        brideName,
        location,
        date: dateStr ? new Date(dateStr) : null,
        ...(coverImageUrl && { coverImage: coverImageUrl }), // Only update cover if new one provided
        galleryImages: {
          create: newGalleryImageUrls.map(url => ({ url }))
        }
      },
      create: {
        projectId,
        groomName,
        brideName,
        location,
        date: dateStr ? new Date(dateStr) : null,
        coverImage: coverImageUrl || "",
        galleryImages: {
          create: newGalleryImageUrls.map(url => ({ url }))
        }
      }
    });

    revalidatePath(`/wedding/${projectId}/details`);
    return { message: "Success! Wedding details saved." };

  } catch (error) {
    console.error(error);
    return { message: "Error saving details." };
  }
}

export async function getWeddingDetails(projectId: string) {
    try {   
        return await prisma.weddingDetails.findUnique({
        where: { projectId },
        include: { galleryImages: true }, // Include the gallery relation
        });
    }
    catch (error) {
        
        return await prisma.weddingDetails.create({
            data: { projectId },
            include: { galleryImages: true }, // Include the gallery relation
        });
    }
  }
export async function getWeddingEvents(projectId: string) {
    return await prisma.event.findMany({
        where: { projectId },
        orderBy: { time: 'asc' },
    });
}








