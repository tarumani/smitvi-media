import { listVideos } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ShortsFeed } from "@/components/ShortsFeed";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = pageMeta({
  title: "Shorts",
  description: "Vertical stories and explainers. Watch. Discover. Share.",
  path: "/shorts",
});

export default async function ShortsPage() {
  const user = await getSessionUser();
  const { items } = await listVideos({ type: "SHORT", sort: "trending", pageSize: 24 });
  const ids = items.map((i) => i.id);
  const liked = user
    ? await prisma.like.findMany({ where: { userId: user.id, videoId: { in: ids } }, select: { videoId: true } })
    : [];
  const saved = user
    ? await prisma.savedVideo.findMany({ where: { userId: user.id, videoId: { in: ids } }, select: { videoId: true } })
    : [];
  return (
    <ShortsFeed
      items={items}
      liked={new Set(liked.map((l) => l.videoId))}
      saved={new Set(saved.map((s) => s.videoId))}
      loggedIn={Boolean(user)}
    />
  );
}
