/**
 * 精选详情页的数据层：content/repos/<slug>.mdx。
 *
 * 详情页是站内的落地页，卡片不再直接把人送去 GitHub。slug 由 owner/repo
 * 推出来并强制与文件名一致，避免同一仓库出现两个 URL。
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { extractHeadings } from "./mdx.ts";
import type { PickDetailInfo } from "./picks.ts";
import {
  LEGACY_REPO_DETAIL_SECTIONS,
  REPO_DETAIL_SECTIONS,
  repoDetailFrontmatter,
  type RepoDetailFrontmatter,
} from "./schema.ts";

export type RepoDetail = {
  slug: string;
  data: RepoDetailFrontmatter;
  body: string;
};

export const REPO_DIR = join(process.cwd(), "content", "repos");

export function slugForRepo(repo: string): string {
  return repo.trim().toLowerCase().replace("/", "--");
}

function formatIssues(where: string, issues: { path: (string | number)[]; message: string }[]): string {
  const lines = issues.map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  return `${where} 校验失败：\n${lines.join("\n")}`;
}

/** 纯函数：测试和构建共用同一套校验，缺一节就抛错而不是渲染空壳 */
export function parseRepoDetail(slug: string, raw: string): RepoDetail {
  const { data, content } = matter(raw);
  const parsed = repoDetailFrontmatter.safeParse(data);
  if (!parsed.success) throw new Error(formatIssues(`content/repos/${slug}.mdx`, parsed.error.issues));

  const expected = slugForRepo(parsed.data.repo);
  if (expected !== slug) {
    throw new Error(`content/repos/${slug}.mdx：slug 应为 ${expected}（repo=${parsed.data.repo}）`);
  }

  const headings = new Set(extractHeadings(content).map((heading) => heading.text));
  // 迁移期两套标题并存：哪套缺得少就报哪套，等 73 篇全迁完再删掉旧的一套
  const missingNew = REPO_DETAIL_SECTIONS.filter((section) => !headings.has(section));
  const missingLegacy = LEGACY_REPO_DETAIL_SECTIONS.filter((section) => !headings.has(section));
  const missing = missingNew.length <= missingLegacy.length ? missingNew : missingLegacy;
  if (missing.length > 0) {
    throw new Error(`content/repos/${slug}.mdx：缺少小节 ${missing.join("、")}`);
  }

  return { slug, data: parsed.data, body: content };
}

function listSlugs(): string[] {
  try {
    return readdirSync(REPO_DIR)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export function getAllRepoDetails(): RepoDetail[] {
  return listSlugs()
    .map((slug) => parseRepoDetail(slug, readFileSync(join(REPO_DIR, `${slug}.mdx`), "utf8")))
    .sort((a, b) => b.data.featuredAt.getTime() - a.data.featuredAt.getTime() || a.slug.localeCompare(b.slug));
}

export function getRepoDetail(slug: string): RepoDetail | undefined {
  return getAllRepoDetails().find((detail) => detail.slug === slug);
}

/** 精选列表用：repo（小写）→ 详情页信息；没有详情的项目不在 map 里 */
export type DetailInfo = PickDetailInfo;

export function detailInfoMap(): Record<string, DetailInfo> {
  const map: Record<string, DetailInfo> = {};
  for (const detail of getAllRepoDetails()) {
    map[detail.data.repo.toLowerCase()] = {
      slug: detail.slug,
      summary: detail.data.summary,
      domains: detail.data.domains,
      forms: detail.data.forms,
      peers: detail.data.peers,
      verdict: detail.data.verdict,
    };
  }
  return map;
}
