import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId } from "@/lib/session";

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const creator = await prisma.creator.findUnique({ where: { id } });
    if (!creator) return jsonError("Not found", 404);
    if (creator.userId === user.id) return jsonError("You cannot follow yourself");
    const existing = await prisma.follow.findUnique({
      where: { followerId_creatorId: { followerId: user.id, creatorId: id } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.follow.delete({ where: { followerId_creatorId: { followerId: user.id, creatorId: id } } }),
        prisma.creator.update({ where: { id }, data: { followersCount: { decrement: 1 } } }),
      ]);
      return Response.json({ following: false });
    }
    await prisma.$transaction([
      prisma.follow.create({ data: { followerId: user.id, creatorId: id } }),
      prisma.creator.update({ where: { id }, data: { followersCount: { increment: 1 } } }),
    ]);
    const sessionId = await getOrCreateAnonymousId();
    await trackEvent({ type: "FOLLOW", sessionId, userId: user.id });
    return Response.json({ following: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
