"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// 1. Fetch Public Data (All in one go for speed)
export async function getPublicWeddingData(projectId: string) {
  try {
    const wedding = await prisma.project.findUnique({
      where: { id:projectId },
      include: {
        events: { orderBy: { date: 'asc' } },
        galleryImages: { take: 12 }, // Limit for performance
        weddingDetails: {
            include: {
                galleryImages: true
            }
        },
        gifts: { 
           orderBy: { price: 'asc' } 
        }
      }
    });
    
    // Fallback: If gifts aren't directly linked to weddingDetails but to projectId
    if (wedding && (!wedding.gifts || wedding.gifts.length === 0)) {
       const gifts = await prisma.gift.findMany({ where: { projectId } });
       return { ...wedding, gifts };
    }

    return wedding;
  } catch (error) {
    console.error("Error fetching public data:", error);
    return null;
  }
}

// 2. Submit RSVP
export async function submitRSVP(prevState: any, formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const attending = formData.get("attending") === "yes";
  const dietary = formData.get("dietary") as string;
  const plusOne = formData.get("plusOne") === "on";

  if (!projectId || !name) return { success: false, message: "Name is required" };

  try {
    // Find the wedding ID first


    await prisma.guest.create({
      data: {
        projectId,
        name,
        email,
        attending,
        dietary,
        plusOne
      }
    });

    return { success: true, message: "Thank you! Your RSVP has been sent." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "Something went wrong." };
  }
}

// 3. Claim Gift
export async function claimGift(giftId: string, guestName: string, message: string) {
  try {
    await prisma.gift.update({
      where: { id: giftId },
      data: {
        takenBy: guestName,
        message: message
      }
    });
    // Revalidate the public page so the gift shows as taken
    revalidatePath("/w/[id]", "page"); 
    return { success: true };
  } catch (e) {
    console.error("Claim Error:", e);
    return { success: false };
  }
}