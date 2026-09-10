import { CategoryCard } from "@/components/Cards";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Categories",
  description: "Explore Smitvi Media by topic.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Categories</h1>
      <p className="mt-2 text-muted">Find useful, interesting, and well-made work by subject.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
