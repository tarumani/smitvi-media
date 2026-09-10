import { Ctx } from "@/lib/route";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function POST(req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    const { action } = await req.json();
    if (action === "suspend") {
      await prisma.user.update({ where: { id }, data: { status: "SUSPENDED" } });
    } else if (action === "restore") {
      await prisma.user.update({ where: { id }, data: { status: "ACTIVE" } });
    } else if (action === "delete") {
      await prisma.user.update({ where: { id }, data: { status: "DELETED" } });
    } else return jsonError("Unknown action");
    return Response.json({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}
