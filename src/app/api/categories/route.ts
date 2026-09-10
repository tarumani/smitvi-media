import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } });
  return Response.json(categories);
}
