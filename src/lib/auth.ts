import { getSessionUser, type SessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  const db = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, status: true, role: true },
  });
  if (!db || db.status !== "ACTIVE") {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return { ...user, role: db.role };
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return user;
}

export function isAdmin(user: SessionUser | null) {
  return user?.role === "ADMIN";
}

export async function ensureCreatorForUser(userId: string) {
  const existing = await prisma.creator.findUnique({ where: { userId } });
  if (existing) return existing;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const creator = await prisma.creator.create({
    data: {
      userId: user.id,
      displayName: user.name,
      username: user.username,
      description: user.bio,
      status: "APPROVED",
    },
  });
  if (user.role === "USER") {
    await prisma.user.update({ where: { id: userId }, data: { role: "CREATOR" } });
  }
  return creator;
}
