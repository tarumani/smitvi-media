import { prisma } from "@/lib/prisma";
import { requireUser, ensureCreatorForUser } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, maxBytes, putObject } from "@/lib/storage";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { uniqueSlug } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "upload"), 10, 60_000);
  if (!rl.ok) return rateLimitResponse(rl.retryAfter);
  try {
    const user = await requireUser();
    const creator = await ensureCreatorForUser(user.id);
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "video");
    const videoId = String(form.get("videoId") || "");
    if (!(file instanceof File)) return jsonError("Missing file");

    if (kind === "thumbnail") {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) return jsonError("Thumbnail must be JPEG, PNG, or WebP");
      if (file.size > maxBytes("image")) return jsonError("Thumbnail is too large");
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = file.type.split("/")[1] || "jpg";
      const stored = await putObject(`thumbs/${creator.id}/${crypto.randomUUID()}.${ext}`, buf, file.type);
      let video = videoId ? await prisma.video.findUnique({ where: { id: videoId } }) : null;
      if (video && video.creatorId !== creator.id) return jsonError("Forbidden", 403);
      if (!video) {
        video = await prisma.video.create({
          data: {
            creatorId: creator.id,
            title: "Untitled",
            slug: await uniqueSlug("untitled", async (s) => Boolean(await prisma.video.findUnique({ where: { slug: s } }))),
            thumbnailUrl: stored.url,
            thumbKey: stored.key,
            status: "DRAFT",
            visibility: "PRIVATE",
          },
        });
      } else {
        video = await prisma.video.update({
          where: { id: video.id },
          data: { thumbnailUrl: stored.url, thumbKey: stored.key },
        });
      }
      return Response.json({ videoId: video.id, url: stored.url });
    }

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) return jsonError("Unsupported video type");
    if (file.size > maxBytes("video")) return jsonError("File exceeds the upload size limit");
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "mp4";
    const stored = await putObject(`videos/${creator.id}/${crypto.randomUUID()}.${ext}`, buf, file.type);
    let video = videoId ? await prisma.video.findUnique({ where: { id: videoId } }) : null;
    if (video && video.creatorId !== creator.id) return jsonError("Forbidden", 403);
    if (!video) {
      video = await prisma.video.create({
        data: {
          creatorId: creator.id,
          title: file.name.replace(/\.[^.]+$/, "") || "Untitled",
          slug: await uniqueSlug(file.name, async (s) => Boolean(await prisma.video.findUnique({ where: { slug: s } }))),
          videoUrl: stored.url,
          storageKey: stored.key,
          status: "DRAFT",
          visibility: "PRIVATE",
        },
      });
    } else {
      video = await prisma.video.update({
        where: { id: video.id },
        data: { videoUrl: stored.url, storageKey: stored.key },
      });
    }
    return Response.json({ videoId: video.id, url: stored.url });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return jsonError(status === 401 ? "Unauthorized" : "Upload failed", status);
  }
}
