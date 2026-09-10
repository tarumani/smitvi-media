import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { registerSchema } from "@/lib/validators";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { jsonError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "register"), 8, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const parsed = registerSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");
  const { name, username, email, password } = parsed.data;
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
  });
  if (exists) return jsonError("Email or username already in use", 409);
  const user = await prisma.user.create({
    data: {
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    },
  });
  await setSessionCookie({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  return Response.json({ ok: true });
}
