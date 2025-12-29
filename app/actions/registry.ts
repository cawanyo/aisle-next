"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- GET REGISTRY ---
export async function getRegistry(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  return await prisma.gift.findMany({
    where: { projectId },
    orderBy: { name: 'asc' }
  });
}

// --- SAVE GIFT (Create/Update) ---
export async function saveGift(projectId: string, item: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  if (item.id) {
    await prisma.gift.update({
      where: { id: item.id },
      data: {
        name: item.name,
        price: parseFloat(item.price || 0),
        url: item.url,
        imageUrl: item.imageUrl,
      }
    });
  } else {
    await prisma.gift.create({
      data: {
        projectId,
        name: item.name,
        price: parseFloat(item.price || 0),
        url: item.url,
        imageUrl: item.imageUrl,
        takenBy: null // Initially available
      }
    });
  }

  revalidatePath(`/project/${projectId}/registry`);
}

// --- DELETE GIFT ---
export async function deleteGift(id: string, projectId: string) {
  await prisma.gift.delete({ where: { id } });
  revalidatePath(`/project/${projectId}/registry`);
}

// --- CLAIM / TRACK GIFT ---
// Used to mark an item as purchased (e.g., "Aunt May bought this")
export async function toggleGiftStatus(id: string, projectId: string, takenBy: string | null) {
  await prisma.gift.update({
    where: { id },
    data: { takenBy }
  });
  revalidatePath(`/project/${projectId}/registry`);
}