"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">Please try again. If this continues, come back later.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-2 text-sm text-bg">
        Retry
      </button>
    </div>
  );
}
