import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Contact", path: "/contact" });

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="display text-4xl">Contact</h1>
      <p className="mt-4 text-muted">
        For partnership, press, or support questions, email{" "}
        <a className="underline" href="mailto:hello@smitvimedia.com">
          hello@smitvimedia.com
        </a>
        .
      </p>
      <p className="mt-2 text-sm text-muted">{site.domain}</p>
    </div>
  );
}
