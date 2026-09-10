"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadWizard({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function uploadFile(kind: "video" | "thumbnail", file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("kind", kind);
    if (videoId) fd.set("videoId", videoId);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setVideoId(data.videoId);
    return data;
  }

  return (
    <ol className="mt-8 space-y-6">
      <Step n={1} current={step} title="Upload video">
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPending(true);
            setError("");
            try {
              await uploadFile("video", file);
              setStep(2);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
            setPending(false);
          }}
        />
      </Step>
      <Step n={2} current={step} title="Upload thumbnail">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPending(true);
            try {
              await uploadFile("thumbnail", file);
              setStep(3);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed");
            }
            setPending(false);
          }}
        />
      </Step>
      <Step n={3} current={step} title="Details">
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!videoId) return;
            const fd = new FormData(e.currentTarget);
            setPending(true);
            const res = await fetch(`/api/videos/${videoId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: fd.get("title"),
                description: fd.get("description"),
                categoryId: fd.get("categoryId"),
                tags: fd.get("tags"),
                videoType: fd.get("videoType"),
                visibility: fd.get("visibility"),
                action: "save",
              }),
            });
            setPending(false);
            if (!res.ok) {
              const data = await res.json();
              setError(data.error || "Could not save");
              return;
            }
            setStep(6);
          }}
        >
          <input name="title" required minLength={3} placeholder="Title" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          <textarea name="description" placeholder="Description" rows={5} className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          <select name="categoryId" required className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input name="tags" placeholder="Tags, comma separated" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2" />
          <p className="text-sm text-muted">Type</p>
          <select name="videoType" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2">
            <option value="VIDEO">Video</option>
            <option value="SHORT">Short</option>
          </select>
          <p className="text-sm text-muted">Visibility</p>
          <select name="visibility" className="w-full rounded-xl border border-line bg-bg-elev px-3 py-2">
            <option value="PUBLIC">Public</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PRIVATE">Private</option>
          </select>
          <button disabled={pending} className="rounded-full bg-ink px-5 py-2 text-sm text-bg">
            Save details
          </button>
        </form>
      </Step>
      <Step n={6} current={step} title="Publish">
        <button
          disabled={pending || !videoId}
          className="rounded-full bg-accent px-5 py-2 text-sm text-white"
          onClick={async () => {
            if (!videoId) return;
            setPending(true);
            const res = await fetch(`/api/videos/${videoId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "publish" }),
            });
            setPending(false);
            if (res.ok) router.push("/creator/dashboard");
            else setError("Could not publish");
          }}
        >
          Publish
        </button>
      </Step>
      {pending ? <p className="text-sm text-muted">Working…</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </ol>
  );
}

function Step({ n, current, title, children }: { n: number; current: number; title: string; children: React.ReactNode }) {
  const active = current >= n;
  return (
    <li className={`rounded-2xl border p-5 ${active ? "border-line bg-bg-elev" : "border-dashed border-line opacity-50"}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Step {n}</p>
      <h2 className="mt-1 font-medium">{title}</h2>
      {active ? <div className="mt-3">{children}</div> : null}
    </li>
  );
}
