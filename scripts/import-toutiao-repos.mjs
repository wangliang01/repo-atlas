// 从头条收藏整理稿里抽取 GitHub 仓库，合并进 content/picks/nominations.json。
// 只写「提名」，不决定是否上榜：status 由人改。
// 用法：node scripts/import-toutiao-repos.mjs [notes 目录] [--dry-run]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import matter from "gray-matter";
import { emptyNominations, extractRepos, mergeNominations } from "../lib/nominations.ts";

const DEFAULT_NOTES = resolve(process.cwd(), "..", "头条收藏内容总结", "notes");
const OUTPUT = resolve(process.cwd(), "content", "picks", "nominations.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const notesDir = resolve(args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_NOTES);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.mdx?$/.test(name) ? [full] : [];
  });
}

function isoDate(value) {
  const text = String(value ?? "");
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
}

if (!existsSync(notesDir)) {
  console.error(`找不到笔记目录：${notesDir}`);
  process.exit(1);
}

const found = [];
const files = walk(notesDir).sort();
for (const file of files) {
  const { data, content } = matter(readFileSync(file, "utf8"));
  if (data.category !== "技术") continue;
  const notePath = `notes/${relative(notesDir, file).replaceAll("\\", "/")}`;
  const date = isoDate(data.published_at);
  const repos = extractRepos(`${content}\n${data.source ?? ""}`);
  for (const repo of repos) {
    found.push({
      repo,
      mention: {
        kind: "toutiao",
        title: String(data.title ?? repo),
        notePath,
        url: String(data.source ?? ""),
        date,
      },
    });
  }
}

const existing = existsSync(OUTPUT)
  ? JSON.parse(readFileSync(OUTPUT, "utf8"))
  : emptyNominations();
const today = new Date().toISOString().slice(0, 10);
const merged = mergeNominations(existing, found, today);

console.log(`扫描 ${files.length} 篇笔记，抽取 ${found.length} 处 GitHub 链接，去重后 ${Object.keys(merged.items).length} 个仓库`);
for (const item of Object.values(merged.items)) {
  console.log(`  ${item.status.padEnd(8)} ${item.repo}  ${item.mentions.length} 处`);
}

if (dryRun) {
  console.log("[dry-run] 不写文件");
} else {
  writeFileSync(OUTPUT, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`写入 ${OUTPUT}`);
}
