import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureCreatorForUser } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatCount, formatDuration } from "@/lib/utils";
import { CreatorVideoTable } from "@/components/CreatorVideoTable";

export const metadata = pageMeta({ title: "Creator dashboard", path: "/creator/dashboard", noIndex: true });

export default async function CreatorDashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/creator/dashboard");
  const creator = await ensureCreatorForUser(session.id);
  const videos = await prisma.video.findMany({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
  });
  const totals = videos.reduce(
    (acc, v) => {
      acc.views += v.viewsCount;
      acc.watch += v.watchTimeSec;
      acc.likes += v.likesCount;
      acc.comments += v.commentsCount;
      acc.shares += v.sharesCount;
      return acc;
    },
    { views: 0, watch: 0, likes: 0, comments: 0, shares: 0 },
  );
  const avg = totals.views ? Math.round(totals.watch / totals.views) : 0;
  const top = [...videos].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Creator dashboard</h1>
          <p className="text-muted">@{creator.username}</p>
        </div>
        <Link href="/creator/upload" className="rounded-full bg-ink px-5 py-2 text-sm text-bg">
          Upload
        </Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views" value={formatCount(totals.views)} />
        <Stat label="Watch time" value={formatDuration(totals.watch)} />
        <Stat label="Followers" value={formatCount(creator.followersCount)} />
        <Stat label="Likes" value={formatCount(totals.likes)} />
        <Stat label="Comments" value={formatCount(totals.comments)} />
        <Stat label="Shares" value={formatCount(totals.shares)} />
        <Stat label="Avg view duration" value={formatDuration(avg)} />
        <Stat label="Published" value={String(videos.filter((v) => v.status === "PUBLISHED").length)} />
      </div>
      <h2 className="display mt-12 text-2xl">Top videos</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {top.map((v) => (
          <li key={v.id}>
            {v.title} · {formatCount(v.viewsCount)} views
          </li>
        ))}
      </ul>
      <h2 className="display mt-12 text-2xl">Content</h2>
      <CreatorVideoTable videos={videos} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-elev p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
    </div>
  );
}
