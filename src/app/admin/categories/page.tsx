import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminCategoryManager } from "@/components/admin/AdminTables";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin categories", path: "/admin/categories", noIndex: true });

export default async function AdminCategoriesPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/login");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-3xl">Categories</h1>
      <AdminCategoryManager categories={categories} />
    </div>
  );
}
