import { CreatorCard } from "@/components/Cards";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Creators",
  description: "People publishing on Smitvi Media.",
  path: "/creators",
});

export default async function CreatorsPage() {
  const creators = await prisma.creator.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ featured: "desc" }, { followersCount: "desc" }],
    include: { user: { select: { avatar: true } } },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-4xl">Creators</h1>
      <p className="mt-2 text-muted">Follow people who make ideas worth watching.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {creators.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>
    </div>
  );
}
