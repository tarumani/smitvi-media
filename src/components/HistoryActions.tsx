"use client";

import { useRouter } from "next/navigation";

export function HistoryActions() {
  const router = useRouter();
  return (
    <button
      className="text-sm text-muted"
      type="button"
      onClick={async () => {
        await fetch("/api/history", { method: "DELETE" });
        router.refresh();
      }}
    >
      Clear all
    </button>
  );
}
