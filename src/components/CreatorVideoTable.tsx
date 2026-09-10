"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  slug: string;
  videoType: "VIDEO" | "SHORT";
  status: string;
  visibility: string;
  viewsCount: number;
};

export function CreatorVideoTable({ videos }: { videos: Row[] }) {
  const router = useRouter();
  async function act(id: string, action: string) {
    await fetch(`/api/videos/${id}`, {
      method: action === "delete" ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ action }),
    });
    router.refresh();
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-elev text-muted">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Views</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id} className="border-t border-line">
              <td className="px-4 py-3">
                <Link href={v.videoType === "SHORT" ? `/short/${v.slug}` : `/video/${v.slug}`}>{v.title}</Link>
              </td>
              <td>{v.videoType}</td>
              <td>
                {v.status} / {v.visibility}
              </td>
              <td>{v.viewsCount}</td>
              <td className="space-x-2 px-4 py-3">
                <button type="button" onClick={() => act(v.id, v.status === "PUBLISHED" ? "unpublish" : "publish")}>
                  {v.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
                <button type="button" onClick={() => act(v.id, "delete")}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
