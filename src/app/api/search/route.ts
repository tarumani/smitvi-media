import { searchContent } from "@/lib/queries";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const rl = rateLimit(clientKey(req, "search"), 40, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const type = (url.searchParams.get("type") as "all" | "videos" | "shorts" | "creators") || "all";
  const sort = url.searchParams.get("sort") ?? "relevance";
  const page = Number(url.searchParams.get("page") ?? 1) || 1;
  const data = await searchContent(q, type, sort, page);
  return Response.json(data);
}
