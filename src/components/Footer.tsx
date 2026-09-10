import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-bg-elev">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="display mt-4 max-w-sm text-2xl leading-snug">{site.tagline}</p>
          <p className="mt-2 text-sm text-muted">{site.supporting}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/watch">Watch</Link></li>
            <li><Link href="/shorts">Shorts</Link></li>
            <li><Link href="/trending">Trending</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/creators">Creators</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/community-guidelines">Community guidelines</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name}. Independent of Smitvi.com.
      </p>
    </footer>
  );
}
