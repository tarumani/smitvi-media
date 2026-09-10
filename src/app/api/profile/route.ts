import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validators";
import { jsonError } from "@/lib/utils";
import { setSessionCookie } from "@/lib/session";

export async function PUT(req: Request) {
  try {
    const session = await requireUser();
    const parsed = profileSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid profile");
    const user = await prisma.user.update({
      where: { id: session.id },
      data: { name: parsed.data.name, bio: parsed.data.bio },
    });
    await setSessionCookie({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
