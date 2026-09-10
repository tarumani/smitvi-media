import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId: id } },
    });
    if (existing) {
      await prisma.$transaction([
        prisma.commentLike.delete({ where: { id: existing.id } }),
        prisma.comment.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return Response.json({ liked: false });
    }
    await prisma.$transaction([
      prisma.commentLike.create({ data: { userId: user.id, commentId: id } }),
      prisma.comment.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
    ]);
    return Response.json({ liked: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
