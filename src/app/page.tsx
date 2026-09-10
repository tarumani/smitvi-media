import Link from "next/link";
import { CategoryCard, CreatorCard, SectionHeader, ShortCard, VideoCard, VideoGrid } from "@/components/Cards";
import { listVideos } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { formatCount } from "@/lib/utils";

export default async function HomePage() {
  const [featured, trending, latest, shorts, categories, creators] = await Promise.all([
    prisma.video.findFirst({
      where: { status: "PUBLISHED", visibility: "PUBLIC", featured: true, videoType: "VIDEO" },
      include: { category: true, creator: { include: { user: { select: { avatar: true } } } } },
      orderBy: { publishedAt: "desc" },
    }),
    listVideos({ type: "VIDEO", sort: "trending", pageSize: 8 }),
    listVideos({ type: "VIDEO", sort: "latest", pageSize: 8 }),
    listVideos({ type: "SHORT", sort: "trending", pageSize: 12 }),
    prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } }),
    prisma.creator.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ featured: "desc" }, { followersCount: "desc" }],
      take: 4,
      include: { user: { select: { avatar: true } } },
    }),
  ]);

  const hero = featured ?? latest.items[0];

  return (
    <div>
      {hero ? (
        <section className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-accent-2">{site.supporting}</p>
              {hero.category ? (
                <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted">{hero.category.name}</p>
              ) : null}
              <h1 className="display mt-3 max-w-xl text-4xl leading-[1.1] sm:text-6xl">{hero.title}</h1>
              <p className="mt-4 max-w-lg text-lg text-muted">{hero.description}</p>
              <p className="mt-3 text-sm text-muted">
                {hero.creator.displayName} · {formatCount(hero.viewsCount)} views
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/video/${hero.slug}`} className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">
                  Watch Now
                </Link>
                <Link href="/watch" className="rounded-full border border-line bg-bg-elev px-6 py-3 text-sm">
                  Browse videos
                </Link>
              </div>
            </div>
            <Link href={`/video/${hero.slug}`} className="relative hidden aspect-video overflow-hidden rounded-3xl shadow-[var(--shadow)] lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-20">
          <p className="text-xs uppercase tracking-[0.28em] text-accent-2">{site.supporting}</p>
          <h1 className="display mt-4 text-5xl">{site.tagline}</h1>
          <p className="mt-4 max-w-xl text-muted">Content is being prepared. Check back soon.</p>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14">
        <section>
          <SectionHeader title="Trending Now" href="/trending" />
          <VideoGrid videos={trending.items} />
        </section>
        <section>
          <SectionHeader title="Latest Videos" href="/latest" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latest.items.map((v) => (
              <VideoCard key={v.slug} video={v} />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Shorts" href="/shorts" />
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
            {shorts.items.map((v) => (
              <ShortCard key={v.slug} video={v} />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Explore Categories" href="/categories" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Popular Creators" href="/creators" />
          <div className="grid gap-4 md:grid-cols-2">
            {creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Recommended" href="/watch" />
          <p className="mb-4 text-sm text-muted">Based on category popularity and recent engagement — not an AI feed.</p>
          <VideoGrid videos={trending.items.slice(0, 4)} />
        </section>
      </div>
    </div>
  );
}
