import { notFound } from "next/navigation";
import { FollowButton } from "@/components/Actions";
import { Avatar, VideoGrid } from "@/components/Cards";
import { prisma } from "@/lib/prisma";
import { listVideos } from "@/lib/queries";
import { getSessionUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { formatCount } from "@/lib/utils";
import { PageParams } from "@/lib/route";

export async function generateMetadata({ params }: PageParams<{ username: string }>) {
  const { username } = await params;
  const creator = await prisma.creator.findUnique({ where: { username } });
  if (!creator) return pageMeta({ title: "Creator", path: `/creator/${username}`, noIndex: true });
  return pageMeta({
    title: creator.displayName,
    description: creator.description ?? `${creator.displayName} on Smitvi Media`,
    path: `/creator/${username}`,
  });
}

export default async function CreatorPage({ params, searchParams }: PageParams<{ username: string }>) {
  const { username } = await params;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "videos";
  const creator = await prisma.creator.findFirst({
    where: { username, status: { not: "SUSPENDED" } },
    include: { user: true },
  });
  if (!creator) notFound();
  const user = await getSessionUser();
  const following = user
    ? await prisma.follow.findUnique({
        where: { followerId_creatorId: { followerId: user.id, creatorId: creator.id } },
      })
    : null;

  const videos =
    tab === "shorts"
      ? await listVideos({ type: "SHORT", creatorId: creator.id, sort: "latest" })
      : tab === "popular"
        ? await listVideos({ type: "VIDEO", creatorId: creator.id, sort: "views" })
        : await listVideos({ type: "VIDEO", creatorId: creator.id, sort: "latest" });

  return (
    <div>
      <div className="h-40 bg-gradient-to-r from-accent-soft to-line md:h-56">
        {creator.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar name={creator.displayName} src={creator.user.avatar} size="lg" />
            <div>
              <h1 className="display text-3xl">{creator.displayName}</h1>
              <p className="text-muted">@{creator.username}</p>
            </div>
          </div>
          <FollowButton creatorId={creator.id} following={Boolean(following)} loggedIn={Boolean(user)} />
        </div>
        <p className="mt-4 max-w-2xl text-muted">{creator.description}</p>
        <p className="mt-2 text-sm text-muted">
          {formatCount(creator.followersCount)} followers · {formatCount(creator.totalViews)} views
        </p>
        <div className="mt-8 flex gap-4 text-sm">
          <a href="?tab=videos" className={tab === "videos" ? "font-medium" : "text-muted"}>
            Videos
          </a>
          <a href="?tab=shorts" className={tab === "shorts" ? "font-medium" : "text-muted"}>
            Shorts
          </a>
          <a href="?tab=popular" className={tab === "popular" ? "font-medium" : "text-muted"}>
            Popular
          </a>
        </div>
        <div className="mt-6">
          <VideoGrid videos={videos.items} />
        </div>
      </div>
    </div>
  );
}
