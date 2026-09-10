import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Terms", path: "/terms" });

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">Terms of Use</h1>
      <p className="mt-6 text-muted">
        By using Smitvi Media you agree to publish only content you have the rights to share, follow community guidelines, and
        accept that we may moderate, unpublish, or remove content that violates those rules.
      </p>
      <p className="mt-4 text-muted">
        Smitvi Media is provided as-is. Have an attorney review these terms before a public commercial launch.
      </p>
    </article>
  );
}
