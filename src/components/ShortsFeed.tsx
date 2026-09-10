"use client";

import { useRef } from "react";
import Link from "next/link";
import { LikeButton, SaveButton, ShareButton } from "@/components/Actions";
import { formatCount } from "@/lib/utils";
import { site } from "@/lib/site";

type Item = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string;
  viewsCount: number;
  likesCount: number;
  creator: { displayName: string; username: string };
};

export function ShortsFeed({
  items,
  liked,
  saved,
  loggedIn,
}: {
  items: Item[];
  liked: Set<string>;
  saved: Set<string>;
  loggedIn: boolean;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="shorts-snap h-[calc(100dvh-4rem)] overflow-y-auto">
        {items.map((item) => (
          <ShortSlide key={item.id} item={item} liked={liked.has(item.id)} saved={saved.has(item.id)} loggedIn={loggedIn} />
        ))}
      </div>
    </div>
  );
}

function ShortSlide({ item, liked, saved, loggedIn }: { item: Item; liked: boolean; saved: boolean; loggedIn: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const src =
    item.videoUrl ??
    `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;

  return (
    <section className="shorts-item relative flex h-[calc(100dvh-4rem)] items-center justify-center px-3 py-4">
      <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-black">
        <video
          ref={ref}
          className="h-full w-full object-cover"
          playsInline
          loop
          poster={item.thumbnailUrl}
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            if (el.paused) el.play();
            else el.pause();
          }}
        >
          <source src={src} />
        </video>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
          <Link href={`/creator/${item.creator.username}`} className="pointer-events-auto text-sm opacity-90">
            @{item.creator.username}
          </Link>
          <h2 className="mt-1 text-lg font-medium">{item.title}</h2>
          <p className="text-xs opacity-80">{formatCount(item.viewsCount)} views</p>
        </div>
        <div className="absolute right-3 bottom-28 flex flex-col gap-2">
          <LikeButton videoId={item.id} liked={liked} count={item.likesCount} loggedIn={loggedIn} />
          <SaveButton videoId={item.id} saved={saved} loggedIn={loggedIn} />
          <ShareButton url={`${site.url}/short/${item.slug}`} title={item.title} videoId={item.id} />
        </div>
      </div>
    </section>
  );
}
