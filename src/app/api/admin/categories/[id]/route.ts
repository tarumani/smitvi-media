import { Ctx } from "@/lib/route";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function PUT(req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
    });
    return Response.json(category);
  } catch {
    return jsonError("Forbidden", 403);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    await prisma.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}
