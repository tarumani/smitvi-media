import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { jsonError } from "@/lib/utils";
import { NextRequest } from "next/server";

function sha(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "reset"), 8, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const body = await req.json();
  if (body.step === "request") {
    const user = await prisma.user.findUnique({ where: { email: String(body.email ?? "").toLowerCase() } });
    if (!user) return Response.json({ ok: true });
    const token = randomBytes(24).toString("hex");
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: sha(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    const reveal = process.env.NODE_ENV !== "production";
    return Response.json({ ok: true, ...(reveal ? { token } : {}) });
  }
  if (body.step === "confirm") {
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    if (password.length < 8) return jsonError("Password too short");
    const row = await prisma.passwordReset.findUnique({ where: { tokenHash: sha(token) } });
    if (!row || row.usedAt || row.expiresAt < new Date()) return jsonError("Invalid token", 400);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
      prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);
    return Response.json({ ok: true });
  }
  return jsonError("Invalid request");
}
