"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- GET ROADMAP ---
export async function getRoadmap(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  // Simple check: does user have access?
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  // Fetch Phases & Tasks
  const phases = await prisma.phase.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: {
      tasks: {
        orderBy: { order: "asc" },
        include: { assignedTo: true }
      }
    }
  });

  return phases;
}

// --- UPDATE TASK STATUS ---
export async function toggleTask(taskId: string, isCompleted: boolean, projectId: string) {
  // Add auth check here if needed (e.g., Viewers can check off)
  await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted }
  });
  
  // Revalidate the page so UI updates immediately
  revalidatePath(`/project/${projectId}/roadmap`);
}


// Define the shape of data coming from your Setup Form
interface RoadmapInput {
  projectId: string;
  phases: {
    id?: string; // Optional: If it exists, we update. If null, we create.
    title: string;
    order: number;
    tasks: {
      id?: string; // Optional: If exists, we keep data.
      title: string;
      order: number;
    }[];
  }[];
}

export async function saveRoadmapStructure(data: RoadmapInput) {
  const { projectId, phases } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // --- 1. CLEANUP PHASES ---
      // Get IDs of phases currently in the form
      const incomingPhaseIds = phases
        .filter((p) => p.id)
        .map((p) => p.id as string);

      // Delete phases in DB that are NOT in the form (User deleted them)
      await tx.phase.deleteMany({
        where: {
          projectId,
          id: { notIn: incomingPhaseIds },
        },
      });

      // --- 2. UPSERT PHASES & HANDLE TASKS ---
      for (const phase of phases) {
        let phaseId = phase.id;

        if (phaseId) {
          // UPDATE existing Phase
          await tx.phase.update({
            where: { id: phaseId },
            data: { 
              title: phase.title, 
              order: phase.order 
            },
          });
        } else {
          // CREATE new Phase
          const newPhase = await tx.phase.create({
            data: {
              projectId,
              title: phase.title,
              order: phase.order,
            },
          });
          phaseId = newPhase.id;
        }

        // --- 3. CLEANUP TASKS (Within this Phase) ---
        const incomingTaskIds = phase.tasks
          .filter((t) => t.id)
          .map((t) => t.id as string);

        // Delete tasks that were removed in the UI
        await tx.task.deleteMany({
          where: {
            phaseId: phaseId,
            id: { notIn: incomingTaskIds },
          },
        });

        // --- 4. UPSERT TASKS ---
        for (const task of phase.tasks) {
          if (task.id) {
            // UPDATE existing Task (CRITICAL PART)
            // We ONLY update title and order. 
            // We DO NOT touch date, estimatedCost, actualCost, assignedToId
            await tx.task.update({
              where: { id: task.id },
              data: {
                title: task.title,
                order: task.order,
              },
            });
          } else {
            // CREATE new Task
            await tx.task.create({
              data: {
                phaseId: phaseId!,
                title: task.title,
                order: task.order,
                isCompleted: false, // Default
              },
            });
          }
        }
      }
    });

    revalidatePath(`/project/${projectId}/roadmap`);
    return { success: true, message: "Roadmap structure saved!" };
  } catch (error) {
    console.error("Save Roadmap Error:", error);
    return { success: false, message: "Failed to save structure." };
  }
}

export async function assignTask(taskId: string, userId: string | null, projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Optional: Add strict permission check here (Only Owner/Editor can assign?)

  await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: userId }
  });

  revalidatePath(`/project/${projectId}/roadmap`);
}

export async function updateTaskDetails(formData: FormData) {
  const taskId = formData.get("taskId") as string;
  const projectId = formData.get("projectId") as string;
  
  const dateStr = formData.get("date") as string;
  const estimatedCost = formData.get("estimatedCost");
  const actualCost = formData.get("actualCost");
  const isCompleted = formData.get("isCompleted") === "on"; // Checkbox returns "on" if checked


  
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        deadline: dateStr ? new Date(dateStr) : null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost.toString()) : 0,
        realCost: actualCost ? parseFloat(actualCost.toString()) : 0,
        isCompleted: isCompleted,
      },
    });

    revalidatePath(`/project/${projectId}/roadmap`);
    return { message: "Task updated successfully" };
  } catch (error) {
    console.error("Failed to update task", error);
    return { message: "Error updating task" };
  }
}