import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SessionUser } from "@/lib/session";

const nav = [
  { href: "/", label: "Home" },
  { href: "/watch", label: "Watch" },
  { href: "/shorts", label: "Shorts" },
  { href: "/trending", label: "Trending" },
  { href: "/latest", label: "Latest" },
  { href: "/categories", label: "Categories" },
  { href: "/creators", label: "Creators" },
];

export function Header({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-bg-elev hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <Suspense>
            <SearchBar className="hidden min-w-[220px] md:flex md:w-72" />
          </Suspense>
          <ThemeToggle />
          <Link
            href={user ? "/creator/dashboard" : "/login?next=/creator/dashboard"}
            className="hidden rounded-full bg-ink px-3 py-1.5 text-sm text-bg sm:inline-flex"
          >
            Create
          </Link>
          {user ? (
            <Link
              href="/profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft text-sm font-medium"
              aria-label="Profile"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </Link>
          ) : (
            <Link href="/login" className="rounded-full border border-line px-3 py-1.5 text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
