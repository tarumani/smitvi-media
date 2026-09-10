import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata = pageMeta({ title: "Profile", path: "/profile", noIndex: true });

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/profile");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="display text-4xl">Profile</h1>
      <ProfileForm user={{ name: user.name, bio: user.bio ?? "", username: user.username, email: user.email, avatar: user.avatar }} />
    </div>
  );
}
