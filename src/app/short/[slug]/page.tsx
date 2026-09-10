import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton, LikeButton, SaveButton, ShareButton } from "@/components/Actions";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getPublicVideoBySlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PageParams } from "@/lib/route";

export async function generateMetadata({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug } });
  if (!video) return pageMeta({ title: "Short", path: `/short/${slug}`, noIndex: true });
  return pageMeta({ title: video.title, description: video.description, path: `/short/${slug}`, image: video.thumbnailUrl });
}

export default async function ShortPage({ params }: PageParams<{ slug: string }>) {
  const { slug } = await params;
  const user = await getSessionUser();
  const video = await getPublicVideoBySlug(slug, user?.id, user?.role === "ADMIN");
  if (!video || video.videoType !== "SHORT") notFound();
  const [liked, saved, following] = await Promise.all([
    user ? prisma.like.findUnique({ where: { userId_videoId: { userId: user.id, videoId: video.id } } }) : null,
    user ? prisma.savedVideo.findUnique({ where: { userId_videoId: { userId: user.id, videoId: video.id } } }) : null,
    user
      ? prisma.follow.findUnique({ where: { followerId_creatorId: { followerId: user.id, creatorId: video.creatorId } } })
      : null,
  ]);
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-8">
      <div className="w-full overflow-hidden rounded-[28px] bg-black">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} title={video.title} videoId={video.id} />
      </div>
      <h1 className="display mt-5 text-3xl">{video.title}</h1>
      <Link href={`/creator/${video.creator.username}`} className="mt-2 text-sm text-muted">
        {video.creator.displayName}
      </Link>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <LikeButton videoId={video.id} liked={Boolean(liked)} count={video.likesCount} loggedIn={Boolean(user)} />
        <SaveButton videoId={video.id} saved={Boolean(saved)} loggedIn={Boolean(user)} />
        <FollowButton creatorId={video.creator.id} following={Boolean(following)} loggedIn={Boolean(user)} />
      </div>
      <div className="mt-4">
        <ShareButton url={absoluteUrl(`/short/${video.slug}`)} title={video.title} videoId={video.id} />
      </div>
      <Link href="/shorts" className="mt-8 text-sm text-muted">
        Open vertical feed
      </Link>
    </div>
  );
}
