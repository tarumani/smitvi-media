import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validators";
import { jsonError } from "@/lib/utils";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "report"), 10, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  try {
    const user = await requireUser();
    const parsed = reportSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid report");
    const report = await prisma.report.create({
      data: { ...parsed.data, reporterId: user.id },
    });
    return Response.json(report);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
