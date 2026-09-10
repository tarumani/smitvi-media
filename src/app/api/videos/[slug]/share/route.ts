import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId, getSessionUser } from "@/lib/session";

export async function POST(req: Request, ctx: Ctx) {
  const rl = rateLimit(clientKey(req, "share"), 30, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const { slug } = await ctx.params;
  const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
  if (!video) return jsonError("Not found", 404);
  await prisma.video.update({ where: { id: video.id }, data: { sharesCount: { increment: 1 } } });
  const user = await getSessionUser();
  const sessionId = await getOrCreateAnonymousId();
  await trackEvent({ type: "SHARE", sessionId, userId: user?.id, videoId: video.id });
  return Response.json({ ok: true });
}
