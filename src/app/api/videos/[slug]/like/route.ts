import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId } from "@/lib/session";

export async function POST(req: Request, ctx: Ctx) {
  const rl = rateLimit(clientKey(req, "like"), 40, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
    if (!video) return jsonError("Not found", 404);
    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId: user.id, videoId: video.id } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existing.id } }),
        prisma.video.update({ where: { id: video.id }, data: { likesCount: { decrement: 1 } } }),
      ]);
      const count = Math.max(0, video.likesCount - 1);
      return Response.json({ liked: false, count });
    }
    await prisma.$transaction([
      prisma.like.create({ data: { userId: user.id, videoId: video.id } }),
      prisma.video.update({ where: { id: video.id }, data: { likesCount: { increment: 1 } } }),
    ]);
    const sessionId = await getOrCreateAnonymousId();
    await trackEvent({ type: "LIKE", sessionId, userId: user.id, videoId: video.id });
    return Response.json({ liked: true, count: video.likesCount + 1 });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return jsonError("Unauthorized", status);
  }
}
