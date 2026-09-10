import { prisma } from "@/lib/prisma";
import { computeTrendingScore } from "@/lib/trending";

const publicWhere = {
  status: "PUBLISHED" as const,
  visibility: "PUBLIC" as const,
};

export const videoCardSelect = {
  id: true,
  title: true,
  slug: true,
  thumbnailUrl: true,
  videoUrl: true,
  description: true,
  duration: true,
  viewsCount: true,
  likesCount: true,
  videoType: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  creator: {
    select: {
      id: true,
      displayName: true,
      username: true,
      user: { select: { avatar: true } },
    },
  },
} as const;

export async function refreshTrendingScores() {
  const since = new Date(Date.now() - 48 * 3_600_000);
  const videos = await prisma.video.findMany({
    where: publicWhere,
    select: {
      id: true,
      viewsCount: true,
      likesCount: true,
      commentsCount: true,
      sharesCount: true,
      watchTimeSec: true,
      publishedAt: true,
    },
  });

  for (const v of videos) {
    const recentViews = await prisma.videoView.count({
      where: { videoId: v.id, createdAt: { gte: since } },
    });
    const score = computeTrendingScore({
      views: v.viewsCount,
      likes: v.likesCount,
      comments: v.commentsCount,
      shares: v.sharesCount,
      watchTimeSec: v.watchTimeSec,
      recentViews,
      publishedAt: v.publishedAt,
    });
    await prisma.video.update({ where: { id: v.id }, data: { trendingScore: score } });
  }
}

export async function listVideos(opts: {
  type?: "VIDEO" | "SHORT";
  categorySlug?: string;
  sort?: "latest" | "trending" | "views" | "likes";
  page?: number;
  pageSize?: number;
  creatorId?: string;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const take = Math.min(48, opts.pageSize ?? 24);
  const skip = (page - 1) * take;

  const where = {
    ...publicWhere,
    ...(opts.type ? { videoType: opts.type } : {}),
    ...(opts.creatorId ? { creatorId: opts.creatorId } : {}),
    ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
  };

  const orderBy =
    opts.sort === "trending"
      ? [{ trendingScore: "desc" as const }, { viewsCount: "desc" as const }]
      : opts.sort === "views"
        ? [{ viewsCount: "desc" as const }]
        : opts.sort === "likes"
          ? [{ likesCount: "desc" as const }]
          : [{ publishedAt: "desc" as const }];

  const [items, total] = await Promise.all([
    prisma.video.findMany({
      where,
      orderBy,
      skip,
      take,
      select: videoCardSelect,
    }),
    prisma.video.count({ where }),
  ]);

  return { items, total, page, pageSize: take, pages: Math.ceil(total / take) };
}

export async function getPublicVideoBySlug(slug: string, viewerId?: string, isAdmin = false) {
  const video = await prisma.video.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      creator: {
        include: { user: { select: { avatar: true, name: true, username: true, bio: true } } },
      },
    },
  });
  if (!video) return null;

  const allowed =
    isAdmin ||
    (video.status === "PUBLISHED" &&
      (video.visibility === "PUBLIC" || video.visibility === "UNLISTED")) ||
    Boolean(viewerId && video.creator.userId === viewerId);

  if (!allowed) return null;
  return video;
}

export async function relatedVideos(video: {
  id: string;
  categoryId: string | null;
  creatorId: string;
  tags: { tagId: string }[];
}) {
  const tagIds = video.tags.map((t) => t.tagId);
  const items = await prisma.video.findMany({
    where: {
      ...publicWhere,
      videoType: "VIDEO",
      id: { not: video.id },
      OR: [
        video.categoryId ? { categoryId: video.categoryId } : undefined,
        tagIds.length ? { tags: { some: { tagId: { in: tagIds } } } } : undefined,
        { creatorId: video.creatorId },
      ].filter(Boolean) as object[],
    },
    take: 12,
    orderBy: [{ viewsCount: "desc" }, { publishedAt: "desc" }],
    select: videoCardSelect,
  });
  if (items.length >= 8) return items;
  const extra = await prisma.video.findMany({
    where: { ...publicWhere, videoType: "VIDEO", id: { notIn: [video.id, ...items.map((i) => i.id)] } },
    take: 8 - items.length,
    orderBy: { trendingScore: "desc" },
    select: videoCardSelect,
  });
  return [...items, ...extra];
}

export async function searchContent(q: string, type: "all" | "videos" | "shorts" | "creators", sort: string, page = 1) {
  const term = q.trim();
  const take = 24;
  const skip = (page - 1) * take;
  if (!term) return { videos: [], shorts: [], creators: [], categories: [], tags: [], total: 0 };

  const orderBy =
    sort === "views"
      ? { viewsCount: "desc" as const }
      : sort === "likes"
        ? { likesCount: "desc" as const }
        : sort === "latest"
          ? { publishedAt: "desc" as const }
          : { viewsCount: "desc" as const };

  const videoWhere = {
    ...publicWhere,
    OR: [
      { title: { contains: term } },
      { description: { contains: term } },
      { tags: { some: { tag: { name: { contains: term } } } } },
    ],
  };

  const [videos, shorts, creators, categories, tags] = await Promise.all([
    type === "shorts" || type === "creators"
      ? Promise.resolve([])
      : prisma.video.findMany({
          where: { ...videoWhere, videoType: "VIDEO" },
          orderBy,
          skip: type === "videos" ? skip : 0,
          take: type === "videos" ? take : 12,
          select: videoCardSelect,
        }),
    type === "videos" || type === "creators"
      ? Promise.resolve([])
      : prisma.video.findMany({
          where: { ...videoWhere, videoType: "SHORT" },
          orderBy,
          skip: type === "shorts" ? skip : 0,
          take: type === "shorts" ? take : 12,
          select: videoCardSelect,
        }),
    type === "videos" || type === "shorts"
      ? Promise.resolve([])
      : prisma.creator.findMany({
          where: {
            status: "APPROVED",
            OR: [{ displayName: { contains: term } }, { username: { contains: term } }, { description: { contains: term } }],
          },
          take: 12,
          include: { user: { select: { avatar: true } } },
        }),
    prisma.category.findMany({
      where: { status: "active", OR: [{ name: { contains: term } }, { slug: { contains: term } }] },
      take: 8,
    }),
    prisma.tag.findMany({ where: { name: { contains: term } }, take: 8 }),
  ]);

  return {
    videos,
    shorts,
    creators,
    categories,
    tags,
    total: videos.length + shorts.length + creators.length,
  };
}
