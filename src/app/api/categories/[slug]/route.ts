import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return jsonError("Not found", 404);
  return Response.json(category);
}
