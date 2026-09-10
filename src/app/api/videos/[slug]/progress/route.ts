import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId, getSessionUser } from "@/lib/session";

export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
  if (!video) return jsonError("Not found", 404);
  const body = await req.json().catch(() => ({}));
  const user = await getSessionUser();
  const sessionId = await getOrCreateAnonymousId();
  const seconds = Number(body.seconds ?? 0);
  const completed = Boolean(body.completed);
  if (completed) {
    await prisma.video.update({
      where: { id: video.id },
      data: { watchTimeSec: { increment: video.duration || seconds } },
    });
    await trackEvent({ type: "COMPLETED", sessionId, userId: user?.id, videoId: video.id });
  } else if (seconds > 0) {
    await prisma.video.update({
      where: { id: video.id },
      data: { watchTimeSec: { increment: 5 } },
    });
    await trackEvent({ type: "PROGRESS", sessionId, userId: user?.id, videoId: video.id, metadata: { seconds } });
  }
  if (user) {
    await prisma.watchHistory.upsert({
      where: { userId_videoId: { userId: user.id, videoId: video.id } },
      update: { watchDuration: seconds, completed },
      create: { userId: user.id, videoId: video.id, watchDuration: seconds, completed },
    });
  }
  return Response.json({ ok: true });
}
