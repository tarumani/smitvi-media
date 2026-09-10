"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileForm({
  user,
}: {
  user: { name: string; bio: string; username: string; email: string; avatar: string | null };
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");

  return (
    <div className="mt-6 space-y-6">
      <p className="text-sm text-muted">
        @{user.username} · {user.email}
      </p>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: fd.get("name"), bio: fd.get("bio") }),
          });
          setMsg(res.ok ? "Saved" : "Could not save");
        }}
      >
        <label className="block text-sm">
          Name
          <input name="name" defaultValue={user.name} className="mt-1 w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
        </label>
        <label className="block text-sm">
          Bio
          <textarea name="bio" defaultValue={user.bio} rows={4} className="mt-1 w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
        </label>
        <button className="rounded-full bg-ink px-5 py-2 text-sm text-bg">Save</button>
        {msg ? <span className="ml-3 text-sm text-muted">{msg}</span> : null}
      </form>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
          setMsg(res.ok ? "Avatar updated" : "Avatar upload failed");
          router.refresh();
        }}
      >
        <label className="block text-sm">
          Avatar
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" />
        </label>
        <button className="rounded-full border border-line px-5 py-2 text-sm">Upload avatar</button>
      </form>
      <div className="flex gap-3 text-sm">
        <a href="/saved">Saved</a>
        <a href="/history">History</a>
        <a href="/creator/dashboard">Creator dashboard</a>
      </div>
      <form
        action={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        }}
      >
        <button className="text-sm text-danger" type="submit">
          Log out
        </button>
      </form>
    </div>
  );
}
