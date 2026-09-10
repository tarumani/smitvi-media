import { prisma } from "@/lib/prisma";

export async function GET() {
  const creators = await prisma.creator.findMany({
    where: { status: "APPROVED" },
    orderBy: { followersCount: "desc" },
    include: { user: { select: { avatar: true } } },
    take: 48,
  });
  return Response.json(creators);
}
