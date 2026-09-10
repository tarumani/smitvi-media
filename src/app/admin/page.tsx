import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { formatCount } from "@/lib/utils";

export const metadata = pageMeta({ title: "Admin", path: "/admin", noIndex: true });

export default async function AdminPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login?next=/admin");
  const [users, creators, videos, shorts, views, comments, reports] = await Promise.all([
    prisma.user.count(),
    prisma.creator.count(),
    prisma.video.count({ where: { videoType: "VIDEO" } }),
    prisma.video.count({ where: { videoType: "SHORT" } }),
    prisma.video.aggregate({ _sum: { viewsCount: true } }),
    prisma.comment.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  const stats = [
    ["Users", users],
    ["Creators", creators],
    ["Videos", videos],
    ["Shorts", shorts],
    ["Views", views._sum.viewsCount ?? 0],
    ["Comments", comments],
    ["Open reports", reports],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Admin</h1>
      <nav className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/videos">Videos</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/creators">Creators</Link>
        <Link href="/admin/categories">Categories</Link>
        <Link href="/admin/reports">Reports</Link>
      </nav>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-bg-elev p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
            <p className="mt-2 text-2xl">{formatCount(n)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
