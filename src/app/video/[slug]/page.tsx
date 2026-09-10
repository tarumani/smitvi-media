import { notFound } from "next/navigation";
import Link from "next/link";
import { Comments } from "@/components/Comments";
import { FollowButton, LikeButton, SaveButton, ShareButton } from "@/components/Actions";
import { Avatar, VideoGrid } from "@/components/Cards";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getPublicVideoBySlug, relatedVideos } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { breadcrumbJsonLd, pageMeta, videoJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { formatCount, formatRelativeDate } from "@/lib/utils";
import { PageParams } from "@/lib/route";

export async function generateMetadata({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug } });
  if (!video || video.status !== "PUBLISHED") {
    return pageMeta({ title: "Video", path: `/video/${slug}`, noIndex: true });
  }
  return pageMeta({
    title: video.title,
    description: video.description.slice(0, 160) || video.title,
    path: `/video/${slug}`,
    image: video.thumbnailUrl,
    type: "video.other",
  });
}

export default async function VideoPage({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const user = await getSessionUser();
  const video = await getPublicVideoBySlug(slug, user?.id, user?.role === "ADMIN");
  if (!video) notFound();

  const [related, liked, saved, following, comments] = await Promise.all([
    relatedVideos(video),
    user
      ? prisma.like.findUnique({ where: { userId_videoId: { userId: user.id, videoId: video.id } } })
      : null,
    user
      ? prisma.savedVideo.findUnique({ where: { userId_videoId: { userId: user.id, videoId: video.id } } })
      : null,
    user
      ? prisma.follow.findUnique({ where: { followerId_creatorId: { followerId: user.id, creatorId: video.creatorId } } })
      : null,
    prisma.comment.findMany({
      where: { videoId: video.id, parentId: null, status: "VISIBLE" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, username: true, avatar: true } },
        replies: {
          where: { status: "VISIBLE" },
          include: { user: { select: { name: true, username: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
  ]);

  const url = absoluteUrl(`/video/${video.slug}`);
  const jsonLd = [
    videoJsonLd({
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      slug: video.slug,
      duration: video.duration,
      publishedAt: video.publishedAt,
      creatorName: video.creator.displayName,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Watch", path: "/watch" },
      ...(video.category ? [{ name: video.category.name, path: `/category/${video.category.slug}` }] : []),
      { name: video.title, path: `/video/${video.slug}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} title={video.title} videoId={video.id} />
          <h1 className="display mt-5 text-3xl sm:text-4xl">{video.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>{formatCount(video.viewsCount)} views</span>
            <span>{video.publishedAt ? formatRelativeDate(video.publishedAt) : ""}</span>
            {video.category ? <Link href={`/category/${video.category.slug}`}>{video.category.name}</Link> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <LikeButton videoId={video.id} liked={Boolean(liked)} count={video.likesCount} loggedIn={Boolean(user)} />
            <SaveButton videoId={video.id} saved={Boolean(saved)} loggedIn={Boolean(user)} />
          </div>
          <div className="mt-4">
            <ShareButton url={url} title={video.title} videoId={video.id} />
          </div>
          <div className="mt-8 flex items-start justify-between gap-4 rounded-3xl border border-line bg-bg-elev p-5">
            <Link href={`/creator/${video.creator.username}`} className="flex gap-3">
              <Avatar name={video.creator.displayName} src={video.creator.user.avatar} size="lg" />
              <div>
                <p className="font-medium">{video.creator.displayName}</p>
                <p className="text-sm text-muted">{formatCount(video.creator.followersCount)} followers</p>
                <p className="mt-2 max-w-xl text-sm text-muted">{video.creator.description}</p>
              </div>
            </Link>
            <FollowButton creatorId={video.creator.id} following={Boolean(following)} loggedIn={Boolean(user)} />
          </div>
          <p className="mt-6 whitespace-pre-wrap text-[15px] leading-7">{video.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {video.tags.map((t) => (
              <Link key={t.tagId} href={`/search?q=${encodeURIComponent(t.tag.name)}`} className="rounded-full bg-accent-soft px-3 py-1 text-xs">
                #{t.tag.name}
              </Link>
            ))}
          </div>
          <Comments
            videoId={video.id}
            loggedIn={Boolean(user)}
            initial={comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
              replies: c.replies.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
            }))}
          />
        </div>
        <aside>
          <h2 className="display text-xl">Related</h2>
          <div className="mt-4 grid gap-5">
            <VideoGrid videos={related} />
          </div>
        </aside>
      </div>
    </div>
  );
}
