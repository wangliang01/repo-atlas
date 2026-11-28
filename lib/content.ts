import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { NOTE_KIND_LABEL } from "./labels.ts";
import { getAllRepoDetails } from "./repo-detail.ts";
import {
  NOTE_KINDS,
  noteFrontmatter,
  picksFrontmatter,
  type NoteFrontmatter,
  type PicksFrontmatter,
} from "./schema.ts";

export type Note = {
  slug: string;
  data: NoteFrontmatter;
  body: string;
};

const CONTENT_DIR = join(process.cwd(), "content");

function listMdx(kind: "notes" | "picks"): string[] {
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

export function getAllNotes(): Note[] {
  return listMdx("notes").map(parseNote).sort(byNewest);
}

export function getNote(slug: string): Note | undefined {
  return getAllNotes().find((note) => note.slug === slug);
}

// 精选是快照：只读最新的一份，旧快照留在 git 里
export function getPicksSnapshot(): PicksFrontmatter | undefined {
  return listMdx("picks")
    .map((file) => {
      const where = `content/picks/${file}`;
      const { data } = matter(readFileSync(join(CONTENT_DIR, "picks", file), "utf8"));
      const parsed = picksFrontmatter.safeParse(data);
      if (!parsed.success) {
        // 几十条的快照里只报 entries.6 找不到人，把仓库名带进消息
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
    .sort((a, b) => b.syncedAt.getTime() - a.syncedAt.getTime())[0];
}

// 右栏"最近更新"：内容里最新的那一天；还没内容才退回构建日
export function getLatestUpdate(): Date {
  const dates = getAllNotes().map((note) => note.data.publishedAt.getTime());
  // 精选同步也算更新：只算笔记的话，日期会比精选旧
  const synced = getPicksSnapshot()?.syncedAt.getTime();
  if (synced) dates.push(synced);
  for (const detail of getAllRepoDetails()) dates.push(detail.data.featuredAt.getTime());
  return dates.length > 0 ? new Date(Math.max(...dates)) : new Date();
}

// 右栏与目录共用的站点数字。全部来自真实内容，没有一项是估的
export function getSiteCounts(): { notes: number; picks: number; updatedAt: Date } {
  return {
    notes: getAllNotes().length,
    picks: getAllRepoDetails().length,
    updatedAt: getLatestUpdate(),
  };
}

// 笔记列表按类型分组；空类型整组不出现，免得左栏挂一排点进去是空的锚点
export function groupNotesByKind(notes: Note[]): { kind: NoteFrontmatter["kind"]; label: string; notes: Note[] }[] {
  return NOTE_KINDS.map((kind) => ({
    kind,
    label: NOTE_KIND_LABEL[kind],
    notes: notes.filter((note) => note.data.kind === kind),
  })).filter((group) => group.notes.length > 0);
}
