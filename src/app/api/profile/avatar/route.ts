import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALLOWED_IMAGE_TYPES, maxBytes, putObject } from "@/lib/storage";
import { jsonError } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Missing file");
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) return jsonError("Invalid image type");
    if (file.size > maxBytes("image")) return jsonError("File too large");
    const buf = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1] || "jpg";
    const stored = await putObject(`avatars/${user.id}.${ext}`, buf, file.type);
    await prisma.user.update({ where: { id: user.id }, data: { avatar: stored.url } });
    return Response.json({ url: stored.url });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
