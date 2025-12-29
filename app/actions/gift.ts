"use server";

import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client"; // Or import your singleton db instance

const prisma = new PrismaClient();

// ... (Keep your cloudinary config and uploadGiftImage/searchAmazonProducts here) ...

// --- 3. Save Gift to Database ---
export async function createGift(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const imageUrl = formData.get("imageUrl") as string;
  const productUrl = formData.get("productUrl") as string;
  const projectId = formData.get("projectId") as string;

  if (!name || !imageUrl) {
    return { message: "Please provide a name and an image." };
  }

  try {
    await prisma.gift.create({
      data: {
        projectId: projectId,
        name,
        price,
        imageUrl,
        url: productUrl || "#",
      },
    });

    // Refresh the page so the new gift appears immediately
    revalidatePath("/");
    return { message: "Success! Gift added." };
    
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Failed to save gift." };
  }
}

export async function getGifts(projectId: string) {
  const gifts = await prisma.gift.findMany({
    where: { projectId },
  });
  return gifts;
}