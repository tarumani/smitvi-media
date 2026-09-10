import { Pagination, VideoGrid } from "@/components/Cards";
import { listVideos, refreshTrendingScores } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { PageQuery } from "@/lib/route";

export const metadata = pageMeta({
  title: "Trending",
  description: "What people on Smitvi Media are watching now.",
  path: "/trending",
});

export default async function TrendingPage({ searchParams }: PageQuery) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  try {
    await refreshTrendingScores();
  } catch {
    /* ranking refresh is best-effort */
  }
  const { items, pages } = await listVideos({ type: "VIDEO", sort: "trending", page });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Trending</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Ranked from views, recent growth, likes, comments, shares, watch time, and recency. The scoring function lives in one module so it can be replaced later.
      </p>
      <div className="mt-8">
        <VideoGrid videos={items} />
      </div>
      <Pagination page={page} pages={pages} href={(p) => `/trending?page=${p}`} />
    </div>
  );
}
