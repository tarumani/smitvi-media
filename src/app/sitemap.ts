import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [videos, categories, creators] = await Promise.all([
    prisma.video.findMany({
      where: { status: "PUBLISHED", visibility: "PUBLIC" },
      select: { slug: true, videoType: true, updatedAt: true },
    }),
    prisma.category.findMany({ where: { status: "active" }, select: { slug: true, updatedAt: true } }),
    prisma.creator.findMany({ where: { status: "APPROVED" }, select: { username: true, updatedAt: true } }),
  ]);

  const staticPaths = ["/", "/watch", "/shorts", "/trending", "/latest", "/categories", "/creators", "/about", "/contact", "/privacy", "/terms", "/community-guidelines"];

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path), changeFrequency: "daily" as const, priority: path === "/" ? 1 : 0.7 })),
    ...videos.map((v) => ({
      url: absoluteUrl(v.videoType === "SHORT" ? `/short/${v.slug}` : `/video/${v.slug}`),
      lastModified: v.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...creators.map((c) => ({
      url: absoluteUrl(`/creator/${c.username}`),
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
