import { Ctx } from "@/lib/route";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import type { ReportStatus } from "@prisma/client";

export async function POST(req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    const { status, adminNote } = await req.json();
    const allowed: ReportStatus[] = ["OPEN", "REVIEWED", "ACTIONED", "DISMISSED"];
    if (!allowed.includes(status)) return jsonError("Invalid status");
    await prisma.report.update({ where: { id }, data: { status, adminNote } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}
