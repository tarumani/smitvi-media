import { site } from "@/lib/site";

function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="prose mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-4xl">{title}</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted">{children}</div>
    </article>
  );
}

export function AboutPage() {
  return (
    <Legal title="About Smitvi Media">
      <p>
        {site.name} is a standalone digital media platform. Our purpose is simple: help people discover ideas worth watching —
        then give them a reason to return.
      </p>
      <p>
        We are not Smitvi.com. This product is independent. Any future connection to other Smitvi properties will happen through
        explicit APIs, not a shared application or database.
      </p>
      <p>
        Version 1 focuses on video, shorts, creators, and discovery. Articles, podcasts, live, and news are on the roadmap.
      </p>
    </Legal>
  );
}
