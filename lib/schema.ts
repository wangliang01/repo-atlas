import { z } from "zod";
import { CATEGORIES, MAX_CATEGORIES } from "./categories.ts";

export const NOTE_KINDS = ["source", "architecture", "rebuild", "tool"] as const;


// "2026-11-20" 必须按本地时区构造：new Date(str) 走 UTC，跨时区会差一天。
// 但 YAML 会把不带引号的日期直接解析成 Date（UTC 零点），所以两条路都要接住。
export const dateOnly = z
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

// 精选详情页：只描述 GitHub 项目本身，不冒充第一人称实测。
// readmeSha 锁住摘要对应的 README 版本，仓库更新后能发现内容过期。
export const repoDetailFrontmatter = z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "repo 必须是 owner/name"),
  title: z.string().min(1),
  summary: z.string().min(1),
  /** 卡片上的中文一句话，来自详情页；不要再从英文 description 机翻 */
  categories: z.array(z.enum(CATEGORIES)).min(1).max(MAX_CATEGORIES),
  verdict: z.enum(["recommend", "watch", "avoid"]),
  license: z.string().min(1).optional(),
  /** README 首图/封面，做详情页 banner；没有就不显示 */
  banner: z.string().url("banner 必须是完整 URL").optional(),
  featuredAt: dateOnly,
  readmeSha: z.string().min(1),
  readmeFetchedAt: dateOnly,
  sources: z.array(z.enum(["github", "toutiao", "last30days"])).default(["github"]),
});

export type RepoDetailFrontmatter = z.infer<typeof repoDetailFrontmatter>;

export const REPO_DETAIL_SECTIONS = ["它是什么", "怎么上手", "值得注意的设计", "边界与风险", "来源"] as const;

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
  // 最近 7 天星数增量；台账刚上线时还没有采样，留空
  starsDelta7d: z.number().optional(),
  trendScore: z.number().nonnegative().optional(),
  bucket: z.enum(["anchor", "fresh", "momentum", "nominated"]).optional(),
  discoveredVia: z.array(z.enum(["github", "last30days", "toutiao"])).default(["github"]),
  sourceNotes: z.array(z.string()).default([]),
  createdAt: dateOnly,
  pushedAt: dateOnly,
  // 第一次出现在榜单上的日期，由 content/picks/history.json 决定；当天上榜的标「新上榜」
  firstSeen: dateOnly,
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
