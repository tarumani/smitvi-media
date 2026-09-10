import { listVideos } from "@/lib/queries";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1) || 1;
  const data = await listVideos({ type: "SHORT", sort: "trending", page });
  return Response.json(data);
}
