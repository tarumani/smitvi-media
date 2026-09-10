import { notFound } from "next/navigation";
import { CreatorCard, SectionHeader, ShortCard, VideoGrid } from "@/components/Cards";
import { listVideos } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { PageParams } from "@/lib/route";

export async function generateMetadata({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return pageMeta({ title: "Category", path: `/category/${slug}`, noIndex: true });
  return pageMeta({
    title: cat.name,
    description: cat.description ?? `Videos in ${cat.name}`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || category.status !== "active") notFound();

  const [featured, trending, latest, shorts, creators] = await Promise.all([
    prisma.video.findFirst({
      where: { status: "PUBLISHED", visibility: "PUBLIC", categoryId: category.id, videoType: "VIDEO" },
      orderBy: { viewsCount: "desc" },
      include: { creator: { include: { user: { select: { avatar: true } } } }, category: true },
    }),
    listVideos({ type: "VIDEO", sort: "trending", categorySlug: slug, pageSize: 8 }),
    listVideos({ type: "VIDEO", sort: "latest", categorySlug: slug, pageSize: 8 }),
    listVideos({ type: "SHORT", sort: "latest", categorySlug: slug, pageSize: 8 }),
    prisma.creator.findMany({
      where: { status: "APPROVED", videos: { some: { categoryId: category.id, status: "PUBLISHED" } } },
      take: 4,
      include: { user: { select: { avatar: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Category</p>
      <h1 className="display mt-2 text-4xl">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{category.description}</p>
      {featured ? (
        <div className="mt-8">
          <SectionHeader title="Featured" />
          <VideoGrid videos={[featured]} />
        </div>
      ) : null}
      <div className="mt-12">
        <SectionHeader title="Trending" />
        <VideoGrid videos={trending.items} />
      </div>
      <div className="mt-12">
        <SectionHeader title="Latest" />
        <VideoGrid videos={latest.items} />
      </div>
      <div className="mt-12">
        <SectionHeader title="Shorts" href="/shorts" />
        <div className="flex gap-4 overflow-x-auto">
          {shorts.items.map((v) => (
            <ShortCard key={v.slug} video={v} />
          ))}
        </div>
      </div>
      <div className="mt-12">
        <SectionHeader title="Popular creators" />
        <div className="grid gap-4 md:grid-cols-2">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
