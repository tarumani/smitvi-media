import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminCreatorTable } from "@/components/admin/AdminTables";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin creators", path: "/admin/creators", noIndex: true });

export default async function AdminCreatorsPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const creators = await prisma.creator.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { email: true } } } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-3xl">Creators</h1>
      <AdminCreatorTable creators={creators} />
    </div>
  );
}
