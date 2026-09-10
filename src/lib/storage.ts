import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StoredObject = { key: string; url: string };

function driver() {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local";
}

function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
}

function cdnOr(url: string) {
  const cdn = process.env.CDN_BASE_URL?.replace(/\/$/, "");
  if (!cdn) return url;
  try {
    const u = new URL(url, process.env.NEXT_PUBLIC_SITE_URL);
    return `${cdn}${u.pathname}`;
  } catch {
    return url;
  }
}

function s3() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<StoredObject> {
  if (driver() === "s3") {
    const bucket = process.env.S3_BUCKET!;
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    const base = (process.env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    const url = base ? `${base}/${key}` : `s3://${bucket}/${key}`;
    return { key, url: cdnOr(url) };
  }

  const dest = path.join(uploadRoot(), key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, body);
  const url = `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
  return { key, url: cdnOr(url) };
}

export async function deleteObject(key: string) {
  if (!key) return;
  if (driver() === "s3") {
    await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    return;
  }
  try {
    await unlink(path.join(uploadRoot(), key));
  } catch {
    /* ignore missing */
  }
}

export async function readLocalObject(key: string) {
  const dest = path.join(uploadRoot(), key);
  const resolved = path.resolve(dest);
  const root = uploadRoot();
  if (!resolved.startsWith(root)) throw new Error("Invalid path");
  return readFile(resolved);
}

export async function signedReadUrl(key: string, expiresIn = 3600) {
  if (driver() !== "s3") {
    return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    { expiresIn },
  );
}

export const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function maxBytes(kind: "video" | "short" | "image") {
  if (kind === "image") return 8 * 1024 * 1024;
  if (kind === "short") return Number(process.env.UPLOAD_MAX_SHORT_BYTES ?? 157286400);
  return Number(process.env.UPLOAD_MAX_BYTES ?? 524288000);
}
