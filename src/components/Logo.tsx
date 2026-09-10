import Link from "next/link";
import { site } from "@/lib/site";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name} home`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-2xl bg-ink text-bg">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path
            fill="currentColor"
            d="M8 5.5v13l11-6.5L8 5.5zm1.5 2.7 7.1 4.2-7.1 4.2V8.2z"
          />
          <path
            fill="currentColor"
            opacity="0.55"
            d="M4.5 7.2h1.2v9.6H4.5zm2 1.6h1v6.4h-1z"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-medium tracking-tight">Smitvi</span>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-muted">Media</span>
        </span>
      )}
    </Link>
  );
}
