import { redirect } from "next/navigation";
import { EmptyState, VideoGrid } from "@/components/Cards";
import { HistoryActions } from "@/components/HistoryActions";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "History", path: "/history", noIndex: true });

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/history");
  const rows = await prisma.watchHistory.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      video: {
        include: { category: { select: { name: true, slug: true } }, creator: { include: { user: { select: { avatar: true } } } } },
      },
    },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">History</h1>
        <HistoryActions />
      </div>
      <div className="mt-8">
        {rows.length ? (
          <VideoGrid videos={rows.map((r) => r.video)} />
        ) : (
          <EmptyState title="No watch history" body="Videos you play will appear here." />
        )}
      </div>
    </div>
  );
}
