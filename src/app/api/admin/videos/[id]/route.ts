import { Ctx } from "@/lib/route";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function POST(req: Request, ctx: Ctx) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    const { action } = await req.json();
    if (action === "delete") {
      await prisma.video.delete({ where: { id } });
      return Response.json({ ok: true });
    }
    const data =
      action === "publish"
        ? { status: "PUBLISHED" as const, publishedAt: new Date() }
        : action === "unpublish"
          ? { status: "UNPUBLISHED" as const }
          : action === "feature"
            ? { featured: true }
            : action === "block"
              ? { status: "BLOCKED" as const }
              : null;
    if (!data) return jsonError("Unknown action");
    await prisma.video.update({ where: { id }, data });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Forbidden", 403);
  }
}
