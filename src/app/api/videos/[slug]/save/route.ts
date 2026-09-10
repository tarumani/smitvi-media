import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId } from "@/lib/session";

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
    if (!video) return jsonError("Not found", 404);
    const existing = await prisma.savedVideo.findUnique({
      where: { userId_videoId: { userId: user.id, videoId: video.id } },
    });
    if (existing) {
      await prisma.savedVideo.delete({ where: { userId_videoId: { userId: user.id, videoId: video.id } } });
      return Response.json({ saved: false });
    }
    await prisma.savedVideo.create({ data: { userId: user.id, videoId: video.id } });
    const sessionId = await getOrCreateAnonymousId();
    await trackEvent({ type: "SAVE", sessionId, userId: user.id, videoId: video.id });
    return Response.json({ saved: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
