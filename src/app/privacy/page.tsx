import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy", path: "/privacy" });

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">Privacy Policy</h1>
      <p className="mt-6 text-muted">
        Smitvi Media stores the account data you provide (name, username, email, password hash), watch history, likes, comments,
        follows, and saved videos. Guest activity uses an anonymous session cookie for view-count protection and analytics.
      </p>
      <p className="mt-4 text-muted">
        We do not sell personal data. Passwords are hashed. Video files are stored in object storage or a local uploads directory,
        not in the database. This policy is a starting template and should be reviewed by counsel before production launch.
      </p>
    </article>
  );
}
