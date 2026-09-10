"use client";

import { useRef, useState } from "react";

export function VideoPlayer({
  src,
  poster,
  title,
  videoId,
}: {
  src: string;
  poster?: string;
  title: string;
  videoId: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  async function ping(path: string, body: object) {
    try {
      await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      /* ignore analytics failures */
    }
  }

  return (
    <video
      ref={ref}
      className="aspect-video w-full rounded-2xl bg-black object-contain"
      controls
      playsInline
      preload="metadata"
      poster={poster}
      title={title}
      onPlay={() => {
        if (!started) {
          setStarted(true);
          ping(`/api/videos/${videoId}/view`, { event: "started" });
        }
      }}
      onTimeUpdate={() => {
        const el = ref.current;
        if (!el || !el.duration) return;
        if (Math.floor(el.currentTime) % 15 === 0) {
          ping(`/api/videos/${videoId}/progress`, {
            seconds: Math.floor(el.currentTime),
            duration: Math.floor(el.duration),
          });
        }
      }}
      onEnded={() => ping(`/api/videos/${videoId}/progress`, { completed: true })}
    >
      <source src={src} />
      Your browser does not support video playback.
    </video>
  );
}
