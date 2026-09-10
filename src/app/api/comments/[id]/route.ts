import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return jsonError("Not found", 404);
    if (comment.userId !== user.id && user.role !== "ADMIN") return jsonError("Forbidden", 403);
    const { content } = await req.json();
    if (!content || String(content).length > 2000) return jsonError("Invalid content");
    const updated = await prisma.comment.update({ where: { id }, data: { content: String(content) } });
    return Response.json(updated);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return jsonError("Not found", 404);
    if (comment.userId !== user.id && user.role !== "ADMIN") return jsonError("Forbidden", 403);
    await prisma.comment.update({ where: { id }, data: { status: "REMOVED" } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
