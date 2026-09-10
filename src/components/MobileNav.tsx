import Link from "next/link";
import type { SessionUser } from "@/lib/session";

const items = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/watch", label: "Watch", icon: "▷" },
  { href: "/shorts", label: "Shorts", icon: "▤" },
  { href: "/creator/dashboard", label: "Create", icon: "+" },
  { href: "/profile", label: "Profile", icon: "●" },
];

export function MobileNav({ user }: { user: SessionUser | null }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Mobile"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href === "/profile" && !user ? "/login" : item.href === "/creator/dashboard" && !user ? "/login?next=/creator/dashboard" : item.href}
              className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted"
            >
              <span className="text-base text-ink">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
