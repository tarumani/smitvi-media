import { Pagination, ShortCard, VideoGrid } from "@/components/Cards";
import { listVideos } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { PageQuery } from "@/lib/route";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Latest",
  description: "The newest videos and shorts on Smitvi Media.",
  path: "/latest",
});

export default async function LatestPage({ searchParams }: PageQuery) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const [videos, shorts, categories] = await Promise.all([
    listVideos({ type: "VIDEO", sort: "latest", page, categorySlug: category }),
    listVideos({ type: "SHORT", sort: "latest", pageSize: 10, categorySlug: category }),
    prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Latest</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/latest" className={`rounded-full px-3 py-1 text-xs ${!category ? "bg-accent-soft" : "border border-line"}`}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/latest?category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs ${category === c.slug ? "bg-accent-soft" : "border border-line"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <h2 className="display mt-10 text-2xl">Videos</h2>
      <div className="mt-4">
        <VideoGrid videos={videos.items} />
      </div>
      <Pagination page={page} pages={videos.pages} href={(p) => `/latest?page=${p}${category ? `&category=${category}` : ""}`} />
      <h2 className="display mt-12 text-2xl">Shorts</h2>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {shorts.items.map((v) => (
          <ShortCard key={v.slug} video={v} />
        ))}
      </div>
    </div>
  );
}
