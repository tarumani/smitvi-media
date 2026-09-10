import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { UploadWizard } from "@/components/UploadWizard";

export const metadata = pageMeta({ title: "Upload", path: "/creator/upload", noIndex: true });

export default async function UploadPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/creator/upload");
  const categories = await prisma.category.findMany({ where: { status: "active" }, orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="display text-4xl">Upload</h1>
      <p className="mt-2 text-muted">Video file, thumbnail, details, type, visibility, then publish.</p>
      <UploadWizard categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
