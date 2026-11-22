import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  assertAlternativesExist,
  noteFrontmatter,
  picksFrontmatter,
  projectFrontmatter,
  type NoteFrontmatter,
  type PicksFrontmatter,
  type ProjectFrontmatter,
} from "./schema.ts";

export type Project = {
  slug: string;
  data: ProjectFrontmatter;
  body: string;
};

export type Note = {
  slug: string;
  data: NoteFrontmatter;
  body: string;
};

const CONTENT_DIR = join(process.cwd(), "content");

function listMdx(kind: "projects" | "notes" | "picks"): string[] {
  try {
    return readdirSync(join(CONTENT_DIR, kind)).filter((file) => file.endsWith(".mdx"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function formatIssues(where: string, issues: { path: (string | number)[]; message: string }[]): string {
  const lines = issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`);
  return `${where} 校验失败：\n${lines.join("\n")}`;
}

function parseProject(file: string): Project {
  const where = `content/projects/${file}`;
  const raw = readFileSync(join(CONTENT_DIR, "projects", file), "utf8");
  const { data, content } = matter(raw);
  const parsed = projectFrontmatter.safeParse(data);
  if (!parsed.success) throw new Error(formatIssues(where, parsed.error.issues));
  return { slug: file.replace(/\.mdx$/, ""), data: parsed.data, body: content };
}

function parseNote(file: string): Note {
  const where = `content/notes/${file}`;
  const raw = readFileSync(join(CONTENT_DIR, "notes", file), "utf8");
  const { data, content } = matter(raw);
  const parsed = noteFrontmatter.safeParse(data);
  if (!parsed.success) throw new Error(formatIssues(where, parsed.error.issues));
  return { slug: file.replace(/\.mdx$/, ""), data: parsed.data, body: content };
}

const byNewest = (a: { data: { publishedAt: Date } }, b: { data: { publishedAt: Date } }) =>
  b.data.publishedAt.getTime() - a.data.publishedAt.getTime();

export function getAllProjects(): Project[] {
  const projects = listMdx("projects").map(parseProject).sort(byNewest);
  assertAlternativesExist(projects);
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getAllNotes(): Note[] {
  return listMdx("notes").map(parseNote).sort(byNewest);
}

export function getNote(slug: string): Note | undefined {
  return getAllNotes().find((note) => note.slug === slug);
}

// 一期一个文件，条目是数组：轻量条目不值得一个项目一个文件
export function getAllPicks(): PicksFrontmatter[] {
  return listMdx("picks")
    .map((file) => {
      const where = `content/picks/${file}`;
      const { data } = matter(readFileSync(join(CONTENT_DIR, "picks", file), "utf8"));
      const parsed = picksFrontmatter.safeParse(data);
      if (!parsed.success) {
        // 41 条的草稿里只报 entries.6 找不到人，把仓库名带进消息
        const issues = parsed.error.issues.map((issue) => {
          const [field, index] = issue.path;
          const raw = field === "entries" && typeof index === "number" ? data.entries?.[index] : undefined;
          const label = raw?.repo ?? raw?.name;
          return label ? { ...issue, message: `${label}：${issue.message}` } : issue;
        });
        throw new Error(formatIssues(where, issues));
      }
      return parsed.data;
    })
    .sort((a, b) => b.issue - a.issue);
}

// 目录只列真的有条目的分类，且按条目数从多到少，避免一排空 tab
export function getPickCategories(picks: PicksFrontmatter[]): string[] {
  const counts = new Map<string, number>();
  for (const issue of picks) {
    for (const entry of issue.entries) {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category);
}

// 首页"最近更新"：内容里最新的那一天；还没内容才退回构建日
export function getLatestUpdate(): Date {
  const dates = [...getAllProjects(), ...getAllNotes()].map((item) => item.data.publishedAt.getTime());
  return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
}

// 一期 3 个，期号从 1 开始
export function getIssueNumber(): number {
  return Math.max(1, Math.ceil(getAllProjects().length / 3));
}

// 列表按日期倒序：prev 更新、next 更旧
export function getAdjacentProjects(slug: string): { prev?: Project; next?: Project } {
  const all = getAllProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return {};
  return { prev: all[index - 1], next: all[index + 1] };
}
