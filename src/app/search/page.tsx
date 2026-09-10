import { CreatorCard, VideoCard } from "@/components/Cards";
import { searchContent } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import { getOrCreateAnonymousId, getSessionUser } from "@/lib/session";
import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PageQuery } from "@/lib/route";

export const metadata = pageMeta({
  title: "Search",
  description: "Search videos, shorts, and creators on Smitvi Media.",
  path: "/search",
});

export default async function SearchPage({ searchParams }: PageQuery) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const type = (sp.type as "all" | "videos" | "shorts" | "creators") || "all";
  const sort = typeof sp.sort === "string" ? sp.sort : "relevance";
  const results = await searchContent(q, type, sort, 1);
  if (q) {
    const user = await getSessionUser();
    const sessionId = await getOrCreateAnonymousId();
    await trackEvent({ type: "SEARCH", sessionId, userId: user?.id, metadata: { q, type } }).catch(() => null);
  }
  const cats = q ? await prisma.category.findMany({ where: { status: "active", name: { contains: q } } }) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Search</h1>
      <div className="mt-4 max-w-xl">
        <Suspense>
          <SearchBar defaultValue={q} className="flex w-full" />
        </Suspense>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "videos", "shorts", "creators"] as const).map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(q)}&type=${t}&sort=${sort}`}
            className={`rounded-full px-3 py-1.5 text-sm capitalize ${type === t ? "bg-ink text-bg" : "border border-line"}`}
          >
            {t}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {["relevance", "latest", "views", "likes"].map((s) => (
          <Link key={s} href={`/search?q=${encodeURIComponent(q)}&type=${type}&sort=${s}`} className={sort === s ? "underline" : "text-muted"}>
            {s === "views" ? "Most viewed" : s === "likes" ? "Most liked" : s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>
      {!q ? <p className="mt-10 text-muted">Search videos, shorts, creators, categories, and tags.</p> : null}
      {q && results.total === 0 && cats.length === 0 ? <p className="mt-10 text-muted">No matches for “{q}”.</p> : null}
      {results.videos.length ? (
        <section className="mt-10">
          <h2 className="display text-2xl">Videos</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {results.videos.map((v) => (
              <VideoCard key={v.slug} video={v} />
            ))}
          </div>
        </section>
      ) : null}
      {results.shorts.length ? (
        <section className="mt-10">
          <h2 className="display text-2xl">Shorts</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {results.shorts.map((v) => (
              <VideoCard key={v.slug} video={v} />
            ))}
          </div>
        </section>
      ) : null}
      {results.creators.length ? (
        <section className="mt-10">
          <h2 className="display text-2xl">Creators</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {results.creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
