import { Ctx } from "@/lib/route";
import { readLocalObject } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: Ctx) {
  const { path } = await ctx.params;
  const key = path.join("/");
  if (key.includes("..")) return new Response("Invalid", { status: 400 });

  if (key.startsWith("videos/")) {
    const video = await prisma.video.findFirst({ where: { storageKey: key } });
    if (!video) return new Response("Not found", { status: 404 });
    if (video.visibility === "PRIVATE" || video.status !== "PUBLISHED") {
      const user = await getSessionUser();
      const creator = await prisma.creator.findUnique({ where: { id: video.creatorId } });
      const allowed = user && (user.role === "ADMIN" || creator?.userId === user.id);
      if (!allowed) return new Response("Forbidden", { status: 403 });
    }
  }

  try {
    const buf = await readLocalObject(key);
    const ext = key.split(".").pop();
    const type =
      ext === "webm"
        ? "video/webm"
        : ext === "png"
          ? "image/png"
          : ext === "webp"
            ? "image/webp"
            : ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : "video/mp4";
    return new Response(buf, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
