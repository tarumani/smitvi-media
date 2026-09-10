import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validators";
import { jsonError } from "@/lib/utils";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId } from "@/lib/session";

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
  if (!video) return jsonError("Not found", 404);
  const comments = await prisma.comment.findMany({
    where: { videoId: video.id, parentId: null, status: "VISIBLE" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, username: true, avatar: true } },
      replies: {
        where: { status: "VISIBLE" },
        include: { user: { select: { name: true, username: true, avatar: true } } },
      },
    },
  });
  return Response.json(comments);
}

export async function POST(req: Request, ctx: Ctx) {
  const rl = rateLimit(clientKey(req, "comment"), 12, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const video = await prisma.video.findFirst({ where: { OR: [{ id: slug }, { slug }] } });
    if (!video) return jsonError("Not found", 404);
    const parsed = commentSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid comment");
    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        videoId: video.id,
        parentId: parsed.data.parentId || null,
        content: parsed.data.content,
      },
      include: { user: { select: { name: true, username: true, avatar: true } } },
    });
    await prisma.video.update({ where: { id: video.id }, data: { commentsCount: { increment: 1 } } });
    const sessionId = await getOrCreateAnonymousId();
    await trackEvent({ type: "COMMENT", sessionId, userId: user.id, videoId: video.id });
    return Response.json({ ...comment, createdAt: comment.createdAt.toISOString(), replies: [] });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
