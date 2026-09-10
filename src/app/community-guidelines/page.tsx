import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Community guidelines", path: "/community-guidelines" });

export default function GuidelinesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">Community guidelines</h1>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-muted">
        <li>No spam or deceptive engagement schemes.</li>
        <li>Respect copyright. Do not upload work you do not have rights to.</li>
        <li>No hate, harassment, or sexual content involving minors.</li>
        <li>No graphic violence used to shock or harm.</li>
        <li>Do not spread knowingly false information that can cause real-world harm.</li>
        <li>Use the report tools. Moderators can warn, block, remove, or restore content.</li>
      </ul>
    </article>
  );
}
