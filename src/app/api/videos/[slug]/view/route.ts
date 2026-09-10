import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { hoursDedup, trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId, getSessionUser } from "@/lib/session";

export async function POST(req: Request, ctx: Ctx) {
  const rl = rateLimit(clientKey(req, "view"), 60, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const { slug } = await ctx.params;
  const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
  if (!video) return jsonError("Not found", 404);
  const user = await getSessionUser();
  const sessionId = await getOrCreateAnonymousId();
  const since = new Date(Date.now() - hoursDedup() * 3600_000);
  const dup = await prisma.videoView.findFirst({
    where: {
      videoId: video.id,
      createdAt: { gte: since },
      OR: [{ sessionId }, ...(user ? [{ userId: user.id }] : [])],
    },
  });
  await trackEvent({ type: "STARTED", sessionId, userId: user?.id, videoId: video.id });
  if (dup) return Response.json({ counted: false });
  await prisma.$transaction([
    prisma.videoView.create({ data: { videoId: video.id, userId: user?.id, sessionId } }),
    prisma.video.update({
      where: { id: video.id },
      data: { viewsCount: { increment: 1 } },
    }),
    prisma.creator.update({
      where: { id: video.creatorId },
      data: { totalViews: { increment: 1 } },
    }),
  ]);
  if (user) {
    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId: user.id, videoId: video.id } },
      update: {},
      create: { userId: user.id, videoId: video.id },
    });
  }
  return Response.json({ counted: true });
}
