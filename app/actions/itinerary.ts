"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- GET ITINERARY ---
export async function getItinerary(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  return await prisma.event.findMany({
    where: { projectId },
    orderBy: { date: 'asc' }
  });
}

// --- SAVE EVENT (Create/Update) ---
export async function saveEvent(projectId: string, event: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  if (event.id) {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        title: event.title,
        time: event.time,
        location: event.location,
        description: event.description,
        date: new Date(event.date)
      }
    });
  } else {
    // Find last order to append
    const last = await prisma.event.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' }
    });
    const newOrder = (last?.order || 0) + 1;

    await prisma.event.create({
      data: {
        projectId,
        title: event.title,
        time: event.time,
        location: event.location,
        description: event.description,
        order: newOrder,
        date: new Date(event.date)
      }
    });
  }

  revalidatePath(`/project/${projectId}/itinerary`);
}

// --- DELETE EVENT ---
export async function deleteEvent(id: string, projectId: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath(`/project/${projectId}/itinerary`);
}

// --- REORDER EVENTS ---
export async function reorderEvents(projectId: string, items: { id: string, order: number }[]) {
  // Use transaction for bulk updates
  await prisma.$transaction(
    items.map((item) => 
        prisma.event.update({
            where: { id: item.id },
            data: { order: item.order }
        })
    )
  );
  revalidatePath(`/project/${projectId}/itinerary`);
}