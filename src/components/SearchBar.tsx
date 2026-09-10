"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar({ className = "", defaultValue = "" }: { className?: string; defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(defaultValue || params.get("q") || "");

  return (
    <form
      className={`flex items-center gap-2 rounded-full border border-line bg-bg-elev px-3 py-1.5 ${className}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const value = q.trim();
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
    >
      <label className="sr-only" htmlFor="site-search">
        Search Smitvi Media
      </label>
      <svg className="h-4 w-4 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search videos, shorts, creators"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </form>
  );
}
