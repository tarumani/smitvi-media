import Link from "next/link";
import { formatCount, formatDuration, formatRelativeDate } from "@/lib/utils";

export type VideoCardData = {
  title: string;
  slug: string;
  thumbnailUrl: string;
  duration: number;
  viewsCount: number;
  publishedAt: Date | string | null;
  videoType?: "VIDEO" | "SHORT";
  category?: { name: string; slug: string } | null;
  creator: { displayName: string; username: string; user?: { avatar: string | null } | null };
};

export function VideoCard({ video }: { video: VideoCardData }) {
  const href = video.videoType === "SHORT" ? `/short/${video.slug}` : `/video/${video.slug}`;
  const date = video.publishedAt ?? new Date();

  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnailUrl || "/placeholder-thumb.svg"}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        <Link href={`/creator/${video.creator.username}`} className="mt-0.5 shrink-0">
          <Avatar name={video.creator.displayName} src={video.creator.user?.avatar} />
        </Link>
        <div className="min-w-0">
          <Link href={href} className="line-clamp-2 font-medium leading-snug">
            {video.title}
          </Link>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/creator/${video.creator.username}`}>{video.creator.displayName}</Link>
          </p>
          <p className="text-xs text-muted">
            {formatCount(video.viewsCount)} views · {formatRelativeDate(date)}
            {video.category ? (
              <>
                {" · "}
                <Link href={`/category/${video.category.slug}`}>{video.category.name}</Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ShortCard({ video }: { video: VideoCardData }) {
  return (
    <Link href={`/short/${video.slug}`} className="group block w-36 shrink-0 sm:w-40">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnailUrl || "/placeholder-thumb.svg"} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
          <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
          <p className="mt-1 text-xs opacity-80">{formatCount(video.viewsCount)} views</p>
        </div>
      </div>
    </Link>
  );
}

export function CreatorCard({
  creator,
}: {
  creator: {
    displayName: string;
    username: string;
    description?: string | null;
    followersCount: number;
    user?: { avatar: string | null } | null;
  };
}) {
  return (
    <Link href={`/creator/${creator.username}`} className="flex gap-3 rounded-2xl border border-line bg-bg-elev p-4">
      <Avatar name={creator.displayName} src={creator.user?.avatar} size="lg" />
      <div className="min-w-0">
        <p className="font-medium">{creator.displayName}</p>
        <p className="text-sm text-muted">@{creator.username}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{creator.description}</p>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted">{formatCount(creator.followersCount)} followers</p>
      </div>
    </Link>
  );
}

export function CategoryCard({ category }: { category: { name: string; slug: string; description?: string | null } }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="rounded-2xl border border-line bg-bg-elev p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
    >
      <p className="text-xs uppercase tracking-[0.18em] text-accent-2">Category</p>
      <h3 className="display mt-2 text-2xl">{category.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{category.description}</p>
    </Link>
  );
}

export function Avatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={`${dim} rounded-full object-cover`} />
    );
  }
  return (
    <span className={`${dim} grid place-items-center rounded-full bg-accent-soft font-medium`}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function VideoGrid({ videos }: { videos: VideoCardData[] }) {
  return (
    <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.slug} video={v} />
      ))}
    </div>
  );
}

export function SectionHeader({ title, href, action = "See all" }: { title: string; href?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="display text-2xl sm:text-3xl">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm text-muted hover:text-ink">
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <p className="display text-2xl">{title}</p>
      <p className="mt-2 text-muted">{body}</p>
    </div>
  );
}

export function ErrorState({ title = "Something went wrong" }: { title?: string }) {
  return (
    <div className="rounded-3xl border border-danger/30 bg-bg-elev px-6 py-16 text-center">
      <p className="display text-2xl">{title}</p>
      <p className="mt-2 text-muted">Please try again in a moment.</p>
    </div>
  );
}

export function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-video rounded-2xl bg-line" />
          <div className="mt-3 h-4 w-4/5 rounded bg-line" />
          <div className="mt-2 h-3 w-1/2 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className="rounded-full border border-line px-4 py-2 text-sm">
          Previous
        </Link>
      ) : null}
      <span className="px-3 py-2 text-sm text-muted">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="rounded-full border border-line px-4 py-2 text-sm">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
