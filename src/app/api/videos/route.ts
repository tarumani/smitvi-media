import { listVideos } from "@/lib/queries";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1) || 1;
  const sort = (searchParams.get("sort") as "latest" | "trending" | "views" | "likes") || "latest";
  const type = searchParams.get("type") === "SHORT" ? "SHORT" : "VIDEO";
  const categorySlug = searchParams.get("category") ?? undefined;
  const data = await listVideos({ type, sort, page, categorySlug });
  return Response.json(data);
}
