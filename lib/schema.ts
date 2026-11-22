import { z } from "zod";

export const VERDICTS = ["recommend", "watch", "avoid"] as const;
export const DEPLOYS = ["docker", "binary", "cloud", "library"] as const;
export const SETUP_TIMES = ["5min", "30min", "halfday", "day+"] as const;
export const MAINTENANCE = ["active", "slowing", "stale"] as const;
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

export const projectFrontmatter = z.object({
  name: z.string().min(1),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "repo 必须是 owner/name"),
  tagline: z.string().min(1).max(24, "tagline 不超过 24 字"),
  verdict: z.enum(VERDICTS),
  topics: z.array(z.string().min(1)).min(1),
  replaces: z.array(z.string().min(1)),
  deploy: z.enum(DEPLOYS),
  setupTime: z.enum(SETUP_TIMES),
  maintenance: z.enum(MAINTENANCE),
  license: z.string().min(1),
  language: z.string().min(1),
  stars: z.number().int().nonnegative(),
  // 没有真截图时不填，页面渲染索引卡占位；别填不存在的路径
  screenshot: z.string().startsWith("/", "screenshot 必须是站内绝对路径").optional(),
  publishedAt: dateOnly,
  highlight: z.string().min(1),
  forWho: z.string().min(1),
  notFor: z.string().min(1),
  alternatives: z.array(z.string().min(1)),
});

export const noteFrontmatter = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  kind: z.enum(NOTE_KINDS),
  publishedAt: dateOnly,
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatter>;
export type NoteFrontmatter = z.infer<typeof noteFrontmatter>;

// 精选是"值得看一眼"的量级：只留一句自己的判断，不写六段
export const pickEntry = z.object({
  name: z.string().min(1),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "repo 必须是 owner/name"),
  category: z.string().min(1),
  tagline: z.string().min(1),
  why: z.string().min(1, "why 不能为空：照抄简介不算收录，写一句你自己的判断"),
  stars: z.number().int().nonnegative().optional(),
  language: z.string().min(1).optional(),
});

export const picksFrontmatter = z.object({
  issue: z.number().int().positive(),
  publishedAt: dateOnly,
  entries: z.array(pickEntry).min(1),
});

export type PickEntry = z.infer<typeof pickEntry>;
export type PicksFrontmatter = z.infer<typeof picksFrontmatter>;

type ProjectLike = { slug: string; data: { alternatives: string[] } };

// 站内互链一旦指向不存在的 slug，构建就该停，而不是渲染成死链
export function assertAlternativesExist(projects: ProjectLike[]): void {
  const slugs = new Set(projects.map((p) => p.slug));
  const missing: string[] = [];
  for (const project of projects) {
    for (const alt of project.data.alternatives) {
      if (!slugs.has(alt)) missing.push(`${project.slug} → ${alt}`);
    }
  }
  if (missing.length > 0) {
    throw new Error(`alternatives 指向不存在的条目：${missing.join("、")}`);
  }
}
