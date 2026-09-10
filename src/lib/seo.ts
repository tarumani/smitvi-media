import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

export function pageMeta(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "video.other";
}): Metadata {
  const title = opts.title.includes(site.name) ? opts.title : `${opts.title} · ${site.name}`;
  const description = opts.description ?? site.description;
  const url = absoluteUrl(opts.path);
  const image = opts.image ?? absoluteUrl("/og.png");

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: opts.type === "video.other" ? "video.other" : "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function videoJsonLd(video: {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  slug: string;
  duration: number;
  publishedAt: Date | null;
  creatorName: string;
}) {
  const duration = `PT${Math.max(1, video.duration)}S`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl ? [absoluteUrl(video.thumbnailUrl)] : undefined,
    contentUrl: video.videoUrl.startsWith("http") ? video.videoUrl : absoluteUrl(video.videoUrl),
    embedUrl: absoluteUrl(`/video/${video.slug}`),
    uploadDate: (video.publishedAt ?? new Date()).toISOString(),
    duration,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: absoluteUrl("/"),
    },
    author: {
      "@type": "Person",
      name: video.creatorName,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: absoluteUrl("/"),
    slogan: site.tagline,
  };
}
