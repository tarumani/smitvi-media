import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminVideoTable } from "@/components/admin/AdminTables";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin videos", path: "/admin/videos", noIndex: true });

export default async function AdminVideosPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { creator: { select: { displayName: true, username: true } } },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-3xl">Videos</h1>
      <AdminVideoTable videos={videos} />
    </div>
  );
}
