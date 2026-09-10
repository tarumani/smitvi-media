import { jsonError } from "@/lib/utils";

export function handleError(e: unknown) {
  const status = typeof e === "object" && e && "status" in e ? Number((e as { status: number }).status) : 500;
  const message = status === 401 ? "Please log in" : status === 403 ? "Forbidden" : status >= 500 ? "Something went wrong" : e instanceof Error ? e.message : "Request failed";
  if (status >= 500) console.error(e);
  return jsonError(message, status || 500);
}

export function assertSameOrigin(req: Request) {
  if (process.env.NODE_ENV !== "production") return;
  const origin = req.headers.get("origin");
  const allowed = process.env.NEXT_PUBLIC_SITE_URL;
  if (origin && allowed && !origin.startsWith(allowed.replace(/\/$/, ""))) {
    const err = new Error("Invalid origin");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}
