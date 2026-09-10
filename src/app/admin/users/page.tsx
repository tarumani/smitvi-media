import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminUserTable } from "@/components/admin/AdminTables";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin users", path: "/admin/users", noIndex: true });

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-3xl">Users</h1>
      <AdminUserTable users={users} />
    </div>
  );
}
