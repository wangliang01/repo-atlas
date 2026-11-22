import { z } from "zod";

export const NOTE_KINDS = ["source", "architecture", "rebuild", "tool"] as const;


// "2026-11-20" 必须按本地时区构造：new Date(str) 走 UTC，跨时区会差一天。
// 但 YAML 会把不带引号的日期直接解析成 Date（UTC 零点），所以两条路都要接住。
const dateOnly = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    if (value instanceof Date) {
      return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "日期必须是 YYYY-MM-DD" });
      return z.NEVER;
    }
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  });

export const noteFrontmatter = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  kind: z.enum(NOTE_KINDS),
  publishedAt: dateOnly,
});

export type NoteFrontmatter = z.infer<typeof noteFrontmatter>;

// 精选是数据驱动的雷达：字段全部来自 GitHub API，唯一手写的是可选的 why
export const pickEntry = z.object({
  name: z.string().min(1),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "repo 必须是 owner/name"),
  owner: z.string().min(1),
  avatar: z.string().startsWith("/", "头像必须是站内路径，同步时下载到 public/avatars").optional(),
  description: z.string().min(1),
  language: z.string().min(1).optional(),
  topics: z.array(z.string()).default([]),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative().default(0),
  starsPerDay: z.number().nonnegative().default(0),
  createdAt: dateOnly,
  pushedAt: dateOnly,
  // 有话说才写；没有就不显示，不拿占位文案凑
  why: z.string().min(1).optional(),
});

export const picksFrontmatter = z.object({
  syncedAt: dateOnly,
  query: z.string().min(1),
  entries: z.array(pickEntry).min(1),
});

export type PickEntry = z.infer<typeof pickEntry>;
export type PicksFrontmatter = z.infer<typeof picksFrontmatter>;
