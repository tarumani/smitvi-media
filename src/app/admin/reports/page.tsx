import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminReportTable } from "@/components/admin/AdminTables";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin reports", path: "/admin/reports", noIndex: true });

export default async function AdminReportsPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { reporter: { select: { username: true } } },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-3xl">Reports</h1>
      <AdminReportTable reports={reports} />
    </div>
  );
}
