"use client";

import { useRouter } from "next/navigation";

async function post(url: string, body: object) {
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

export function AdminVideoTable({
  videos,
}: {
  videos: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    featured: boolean;
    videoType: string;
    creator: { displayName: string };
  }>;
}) {
  const router = useRouter();
  return (
    <table className="mt-6 w-full text-left text-sm">
      <thead>
        <tr className="text-muted">
          <th className="py-2">Title</th>
          <th>Creator</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {videos.map((v) => (
          <tr key={v.id} className="border-t border-line">
            <td className="py-2">{v.title}</td>
            <td>{v.creator.displayName}</td>
            <td>
              {v.status}
              {v.featured ? " · featured" : ""}
            </td>
            <td className="space-x-2">
              {["publish", "unpublish", "feature", "block", "delete"].map((action) => (
                <button
                  key={action}
                  className="capitalize"
                  type="button"
                  onClick={async () => {
                    await post(`/api/admin/videos/${v.id}`, { action });
                    router.refresh();
                  }}
                >
                  {action}
                </button>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdminUserTable({
  users,
}: {
  users: Array<{ id: string; email: string; username: string; role: string; status: string }>;
}) {
  const router = useRouter();
  return (
    <table className="mt-6 w-full text-left text-sm">
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-t border-line">
            <td className="py-2">
              {u.username} · {u.email}
            </td>
            <td>
              {u.role} / {u.status}
            </td>
            <td className="space-x-2">
              {["suspend", "restore"].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={async () => {
                    await post(`/api/admin/users/${u.id}`, { action });
                    router.refresh();
                  }}
                >
                  {action}
                </button>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdminCreatorTable({
  creators,
}: {
  creators: Array<{ id: string; displayName: string; username: string; status: string; user: { email: string } }>;
}) {
  const router = useRouter();
  return (
    <table className="mt-6 w-full text-left text-sm">
      <tbody>
        {creators.map((c) => (
          <tr key={c.id} className="border-t border-line">
            <td className="py-2">
              {c.displayName} @{c.username}
            </td>
            <td>{c.status}</td>
            <td className="space-x-2">
              {["approve", "suspend", "restore"].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={async () => {
                    await post(`/api/admin/creators/${c.id}`, { action });
                    router.refresh();
                  }}
                >
                  {action}
                </button>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AdminCategoryManager({
  categories,
}: {
  categories: Array<{ id: string; name: string; slug: string; status: string; sortOrder: number; description: string | null }>;
}) {
  const router = useRouter();
  return (
    <div className="mt-6">
      <form
        className="mb-6 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          await post("/api/admin/categories", {
            name: fd.get("name"),
            description: fd.get("description"),
          });
          router.refresh();
        }}
      >
        <input name="name" required placeholder="Name" className="rounded-xl border border-line bg-bg-elev px-3 py-2" />
        <input name="description" placeholder="Description" className="rounded-xl border border-line bg-bg-elev px-3 py-2" />
        <button className="rounded-full bg-ink px-4 py-2 text-sm text-bg">Create</button>
      </form>
      <ul className="space-y-2 text-sm">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
            <span>
              {c.sortOrder}. {c.name} ({c.status})
            </span>
            <span className="space-x-2">
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/admin/categories/${c.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: c.status === "active" ? "disabled" : "active" }),
                  });
                  router.refresh();
                }}
              >
                {c.status === "active" ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                  router.refresh();
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminReportTable({
  reports,
}: {
  reports: Array<{
    id: string;
    targetType: string;
    reason: string;
    status: string;
    details: string | null;
    reporter: { username: string };
  }>;
}) {
  const router = useRouter();
  return (
    <ul className="mt-6 space-y-3 text-sm">
      {reports.map((r) => (
        <li key={r.id} className="rounded-2xl border border-line p-4">
          <p>
            {r.targetType} · {r.reason} · {r.status} · by @{r.reporter.username}
          </p>
          <p className="text-muted">{r.details}</p>
          <div className="mt-2 space-x-2">
            {["REVIEWED", "ACTIONED", "DISMISSED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={async () => {
                  await post(`/api/admin/reports/${r.id}`, { status });
                  router.refresh();
                }}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
