import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";

export async function DELETE() {
  try {
    const user = await requireUser();
    await prisma.watchHistory.deleteMany({ where: { userId: user.id } });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
