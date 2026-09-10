import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";
import { jsonError, slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    await requireRole(["ADMIN"]);
    const parsed = categorySchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid category");
    const count = await prisma.category.count();
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder ?? count,
        status: parsed.data.status,
      },
    });
    return Response.json(category);
  } catch {
    return jsonError("Forbidden", 403);
  }
}
