import { Pagination, VideoGrid } from "@/components/Cards";
import { listVideos } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { PageQuery } from "@/lib/route";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Watch",
  description: "Browse videos on Smitvi Media.",
  path: "/watch",
});

export default async function WatchPage({ searchParams }: PageQuery) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const sort = (sp.sort as "latest" | "trending" | "views") || "latest";
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const { items, pages } = await listVideos({ type: "VIDEO", sort, page, categorySlug: category });
  const categories = await prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } });

  const qs = (p: number) => {
    const u = new URLSearchParams();
    u.set("page", String(p));
    if (sort) u.set("sort", sort);
    if (category) u.set("category", category);
    return `/watch?${u.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Watch</h1>
      <p className="mt-2 text-muted">A catalog of videos worth your time.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["latest", "Latest"],
          ["trending", "Trending"],
          ["views", "Most viewed"],
        ].map(([k, label]) => (
          <Link
            key={k}
            href={`/watch?sort=${k}${category ? `&category=${category}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-sm ${sort === k ? "bg-ink text-bg" : "border border-line"}`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/watch" className={`rounded-full px-3 py-1 text-xs ${!category ? "bg-accent-soft" : "border border-line"}`}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/watch?sort=${sort}&category=${c.slug}`}
            className={`rounded-full px-3 py-1 text-xs ${category === c.slug ? "bg-accent-soft" : "border border-line"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <VideoGrid videos={items} />
      </div>
      <Pagination page={page} pages={pages} href={qs} />
    </div>
  );
}
