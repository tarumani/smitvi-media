import { redirect } from "next/navigation";
import { EmptyState, VideoGrid } from "@/components/Cards";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Saved", path: "/saved", noIndex: true });

export default async function SavedPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/saved");
  const rows = await prisma.savedVideo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      video: {
        include: { category: { select: { name: true, slug: true } }, creator: { include: { user: { select: { avatar: true } } } } },
      },
    },
  });
  const videos = rows.filter((r) => r.video.status === "PUBLISHED").map((r) => r.video);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Saved</h1>
      <div className="mt-8">
        {videos.length ? <VideoGrid videos={videos} /> : <EmptyState title="Nothing saved yet" body="Save videos while you watch to build a library." />}
      </div>
    </div>
  );
}
