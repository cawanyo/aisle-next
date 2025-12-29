"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- 1. GET ALL PROJECTS FOR USER ---
export async function getUserProjects() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return [];

  const collaborations = await prisma.collaborator.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: { _count: { select: { collaborators: true } } }
      }
    },
    orderBy: { project: { updatedAt: 'desc' } }
  });

  return collaborations;
}

// --- 2. CREATE NEW PROJECT ---
export async function createProject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user) throw new Error("User not found");

  const project = await prisma.project.create({
    data: {
      title: title || "My Wedding",
      collaborators: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      }
    }
  });

  revalidatePath("/dashboard");
  return { success: true, projectId: project.id };
}

// --- 3. GET SINGLE PROJECT DETAILS ---
export async function getProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  // Check access
  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: { select: { collaborators: true, phases: true } }
    }
  });

  return { ...project, currentUserRole: access.role };
}



// ... inside src/actions/project.ts ...

// --- GET PROJECT OVERVIEW STATS ---
export async function getProjectOverview(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  // Run queries in parallel for speed
  const [project, taskStats, budgetStats, teamCount, nextEvent] = await Promise.all([
    // 1. Project Details
    prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, weddingDate: true, partner1Name: true, partner2Name: true, coverImage: true }
    }),

    // 2. Task Progress (Total vs Completed)
    prisma.task.groupBy({
      by: ['isCompleted'],
      where: { phase: { projectId } },
      _count: true,
    }),

    // 3. Budget Summary
    prisma.budgetItem.aggregate({
      where: { projectId },
      _sum: { estimated: true, actual: true, paid: true }
    }),

    // 4. Team Count
    prisma.collaborator.count({ where: { projectId } }),

    // 5. First Event of the day
    prisma.event.findFirst({
      where: { projectId },
      orderBy: [{ date: 'asc' }, { order: 'asc' }]
    })
  ]);

  // Process Task Stats
  const completedTasks = taskStats.find(t => t.isCompleted)?._count || 0;
  const pendingTasks = taskStats.find(t => !t.isCompleted)?._count || 0;
  const totalTasks = completedTasks + pendingTasks;

  return {
    project,
    tasks: { total: totalTasks, completed: completedTasks },
    budget: {
      estimated: budgetStats._sum.estimated || 0,
      actual: budgetStats._sum.actual || 0,
      paid: budgetStats._sum.paid || 0
    },
    teamCount,
    nextEvent
  };
}