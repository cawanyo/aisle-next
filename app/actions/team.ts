"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- GET TEAM MEMBERS ---
export async function getTeam(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;

  // Check access
  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });

  if (!access) return null;

  const team = await prisma.collaborator.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } }
    }
  });

  return { team, currentUserRole: access.role };
}

// --- INVITE MEMBER ---
export async function inviteMember(projectId: string, email: string, role: "EDITOR" | "VIEWER") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester) throw new Error("User not found");

  // Only OWNER can invite
  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: requester.id, projectId } }
  });

  if (access?.role !== "OWNER") throw new Error("Only the owner can invite members");

  // Find target user
  const userToInvite = await prisma.user.findUnique({ where: { email } });
  if (!userToInvite) throw new Error("User not found. They must have an account first.");

  // Check if already member
  const existing = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: userToInvite.id, projectId } }
  });

  if (existing) throw new Error("User is already in the team");

  await prisma.collaborator.create({
    data: {
      userId: userToInvite.id,
      projectId,
      role
    }
  });

  revalidatePath(`/project/${projectId}/team`);
  return { success: true };
}

// --- REMOVE MEMBER ---
export async function removeMember(projectId: string, userIdToRemove: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  const access = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: requester!.id, projectId } }
  });

  if (access?.role !== "OWNER" && requester!.id !== userIdToRemove) {
    throw new Error("Permission denied");
  }

  // Prevent removing the Owner (unless we implement ownership transfer)
  const target = await prisma.collaborator.findUnique({
    where: { userId_projectId: { userId: userIdToRemove, projectId } }
  });

  if (target?.role === "OWNER") throw new Error("Cannot remove the Owner");

  await prisma.collaborator.delete({
    where: { userId_projectId: { userId: userIdToRemove, projectId } }
  });

  revalidatePath(`/project/${projectId}/team`);
  return { success: true };
}