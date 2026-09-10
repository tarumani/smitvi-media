import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only include letters, numbers, and underscores"),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const videoMetaSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(8000).optional().default(""),
  categoryId: z.string().min(1),
  tags: z.string().optional().default(""),
  videoType: z.enum(["VIDEO", "SHORT"]),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export const reportSchema = z.object({
  targetType: z.enum(["VIDEO", "COMMENT", "USER", "CREATOR"]),
  reason: z.enum(["SPAM", "COPYRIGHT", "HATE", "SEXUAL", "VIOLENCE", "MISINFORMATION", "OTHER"]),
  details: z.string().trim().max(2000).optional(),
  videoId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string().optional(),
  creatorId: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional().default(""),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(400).optional().default(""),
  status: z.enum(["active", "disabled"]).optional().default("active"),
  sortOrder: z.coerce.number().int().optional(),
});
