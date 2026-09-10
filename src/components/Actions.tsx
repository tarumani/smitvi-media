"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatCount } from "@/lib/utils";

export function LikeButton({ videoId, liked, count, loggedIn }: { videoId: string; liked: boolean; count: number; loggedIn: boolean }) {
  const [on, setOn] = useState(liked);
  const [n, setN] = useState(count);
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-accent bg-accent-soft" : "border-line"}`}
      onClick={async () => {
        if (!loggedIn) return router.push("/login");
        const res = await fetch(`/api/videos/${videoId}/like`, { method: "POST" });
        if (!res.ok) return toast.push("Could not update like");
        const data = await res.json();
        setOn(data.liked);
        setN(data.count);
      }}
    >
      {on ? "Liked" : "Like"} · {formatCount(n)}
    </button>
  );
}

export function SaveButton({ videoId, saved, loggedIn }: { videoId: string; saved: boolean; loggedIn: boolean }) {
  const [on, setOn] = useState(saved);
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-accent bg-accent-soft" : "border-line"}`}
      onClick={async () => {
        if (!loggedIn) return router.push("/login");
        const res = await fetch(`/api/videos/${videoId}/save`, { method: "POST" });
        if (!res.ok) return toast.push("Could not save");
        const data = await res.json();
        setOn(data.saved);
        toast.push(data.saved ? "Saved" : "Removed from saved");
      }}
    >
      {on ? "Saved" : "Save"}
    </button>
  );
}

export function FollowButton({ creatorId, following, loggedIn }: { creatorId: string; following: boolean; loggedIn: boolean }) {
  const [on, setOn] = useState(following);
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      className={`rounded-full px-4 py-1.5 text-sm ${on ? "border border-line" : "bg-ink text-bg"}`}
      onClick={async () => {
        if (!loggedIn) return router.push("/login");
        const res = await fetch(`/api/creators/${creatorId}/follow`, { method: "POST" });
        if (!res.ok) return toast.push("Could not update follow");
        const data = await res.json();
        setOn(data.following);
      }}
    >
      {on ? "Following" : "Follow"}
    </button>
  );
}

export function ShareButton({ url, title, videoId }: { url: string; title: string; videoId: string }) {
  const toast = useToast();
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  async function share(network?: string) {
    await fetch(`/api/videos/${videoId}/share`, { method: "POST" }).catch(() => null);
    if (!network) {
      await navigator.clipboard.writeText(url);
      toast.push("Link copied");
    }
  }

  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${encoded}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encoded}&text=${text}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${encoded}&text=${text}` },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line px-3 py-1.5 text-sm"
          onClick={() => share(l.name)}
        >
          {l.name}
        </a>
      ))}
      <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" onClick={() => share()}>
        Copy link
      </button>
    </div>
  );
}
