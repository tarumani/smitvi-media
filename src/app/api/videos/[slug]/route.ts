import { Ctx } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPublicVideoBySlug } from "@/lib/queries";
import { jsonError, slugify, uniqueSlug } from "@/lib/utils";
import { videoMetaSchema } from "@/lib/validators";
import { deleteObject } from "@/lib/storage";

async function getVideo(idOrSlug: string) {
  return (
    (await prisma.video.findUnique({ where: { id: idOrSlug }, include: { creator: true, tags: true } })) ??
    (await prisma.video.findUnique({ where: { slug: idOrSlug }, include: { creator: true, tags: true } }))
  );
}

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const bySlug = await getPublicVideoBySlug(slug);
  if (bySlug) return Response.json(bySlug);
  const byId = await prisma.video.findUnique({ where: { id: slug } });
  if (!byId) return jsonError("Not found", 404);
  return Response.json(byId);
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const video = await getVideo(slug);
    if (!video) return jsonError("Not found", 404);
    if (video.creator.userId !== user.id && user.role !== "ADMIN") return jsonError("Forbidden", 403);
    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === "publish") {
      if (!video.title || !video.videoUrl) return jsonError("Add a title and video file before publishing");
      await prisma.video.update({
        where: { id: video.id },
        data: { status: "PUBLISHED", publishedAt: video.publishedAt ?? new Date() },
      });
      return Response.json({ ok: true });
    }
    if (action === "unpublish") {
      await prisma.video.update({ where: { id: video.id }, data: { status: "UNPUBLISHED" } });
      return Response.json({ ok: true });
    }

    const parsed = videoMetaSchema.partial().safeParse(body);
    const data: Record<string, unknown> = {};
    if (parsed.success) {
      if (parsed.data.title) {
        data.title = parsed.data.title;
        if (video.status === "DRAFT") {
          data.slug = await uniqueSlug(parsed.data.title, async (s) => {
            const found = await prisma.video.findUnique({ where: { slug: s } });
            return Boolean(found && found.id !== video.id);
          });
        }
      }
      if (parsed.data.description !== undefined) data.description = parsed.data.description;
      if (parsed.data.categoryId) data.categoryId = parsed.data.categoryId;
      if (parsed.data.videoType) data.videoType = parsed.data.videoType;
      if (parsed.data.visibility) data.visibility = parsed.data.visibility;
      if (parsed.data.tags !== undefined) {
        const names = parsed.data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        await prisma.videoTag.deleteMany({ where: { videoId: video.id } });
        for (const name of names) {
          const tslug = slugify(name);
          const tag = await prisma.tag.upsert({
            where: { slug: tslug },
            update: {},
            create: { name, slug: tslug },
          });
          await prisma.videoTag.create({ data: { videoId: video.id, tagId: tag.id } });
        }
      }
    }
    if (Object.keys(data).length) {
      await prisma.video.update({ where: { id: video.id }, data });
    }
    return Response.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return jsonError(status === 401 ? "Unauthorized" : "Error", status);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireUser();
    const { slug } = await ctx.params;
    const video = await getVideo(slug);
    if (!video) return jsonError("Not found", 404);
    if (video.creator.userId !== user.id && user.role !== "ADMIN") return jsonError("Forbidden", 403);
    if (video.storageKey) await deleteObject(video.storageKey);
    if (video.thumbKey) await deleteObject(video.thumbKey);
    await prisma.video.delete({ where: { id: video.id } });
    return Response.json({ ok: true });
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    return jsonError(status === 401 ? "Unauthorized" : "Error", status);
  }
}
