import { Ctx } from "@/lib/route";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function POST(req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    const { action } = await req.json();
    const status = action === "approve" || action === "restore" ? "APPROVED" : action === "suspend" ? "SUSPENDED" : null;
    if (!status) return jsonError("Unknown action");
    await prisma.creator.update({ where: { id }, data: { status } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}
