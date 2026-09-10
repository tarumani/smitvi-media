import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const creator = await prisma.creator.findFirst({
    where: { OR: [{ id }, { username: id }], status: "APPROVED" },
    include: { user: { select: { avatar: true, bio: true } } },
  });
  if (!creator) return jsonError("Not found", 404);
  return Response.json(creator);
}
