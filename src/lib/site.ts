export const site = {
  name: "Smitvi Media",
  domain: "SmitviMedia.com",
  tagline: "Ideas Worth Watching.",
  supporting: "Watch. Discover. Share.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Smitvi Media is a digital media platform to watch, discover, and share videos and shorts — technology, AI, career, science, and stories worth returning to.",
} as const;

export function absoluteUrl(path = "/") {
  const base = site.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
