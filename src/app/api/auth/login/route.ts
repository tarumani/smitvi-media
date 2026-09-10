import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validators";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { jsonError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "login"), 10, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid credentials", 401);
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.status !== "ACTIVE") return jsonError("Invalid credentials", 401);
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("Invalid credentials", 401);
  await setSessionCookie({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  return Response.json({ ok: true });
}
