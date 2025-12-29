"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export async function getBudgetOverview(projectId: string) {
  try {
    const phases = await prisma.phase.findMany({
      where: { projectId },
      include: {
        tasks: {
          where: {
            OR: [
              { estimatedCost: { gt: 0 } },
              { realCost: { gt: 0 } }
            ]
          },
          orderBy: { deadline: 'asc' } // Sort by date for the graph
        }
      },
      orderBy: { order: 'asc' }
    });

    return phases.filter(phase => phase.tasks.length > 0);
  } catch (error) {
    console.error("Failed to fetch budget", error);
    return [];
  }
}


// --- GET BUDGET ---
export async function getBudget(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  // Access check
  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  const items = await prisma.budgetItem.findMany({
    where: { projectId },
    orderBy: { category: 'asc' } // Group by category implicitly
  });

  return items;
}

// --- ADD / UPDATE ITEM ---
export async function saveBudgetItem(projectId: string, item: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Allow Create (no ID) or Update (has ID)
  if (item.id) {
    await prisma.budgetItem.update({
      where: { id: item.id },
      data: {
        category: item.category,
        name: item.name,
        estimated: parseFloat(item.estimated || 0),
        actual: parseFloat(item.actual || 0),
        paid: parseFloat(item.paid || 0),
      }
    });
  } else {
    await prisma.budgetItem.create({
      data: {
        projectId,
        category: item.category || "General",
        name: item.name,
        estimated: parseFloat(item.estimated || 0),
        actual: parseFloat(item.actual || 0),
        paid: parseFloat(item.paid || 0),
      }
    });
  }

  revalidatePath(`/project/${projectId}/budget`);
}

// --- DELETE ITEM ---
export async function deleteBudgetItem(id: string, projectId: string) {
  await prisma.budgetItem.delete({ where: { id } });
  revalidatePath(`/project/${projectId}/budget`);
}

