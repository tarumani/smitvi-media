import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="display mt-3 text-4xl">This page is not on Smitvi Media</h1>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-sm text-bg">
        Go home
      </Link>
    </div>
  );
}
