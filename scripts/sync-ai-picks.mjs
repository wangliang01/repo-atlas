// 为 content/repos 里的人工收藏项目生成 GitHub 统计快照。
// 用 curl 而不是 fetch：Node 的 fetch 不走系统代理。
// 星数、fork、语言、topics、创建/推送时间全是 API 原值；starsPerDay 由 stars ÷ 建仓天数算。
// 脚本只补统计，不决定首页展示谁：收藏全集永远来自 content/repos。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { getAllRepoDetails } from "../lib/repo-detail.ts";
import { emptyHistory, mergeHistory } from "../lib/picks-history.ts";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function api(url) {
  const headers = ["-H", "Accept: application/vnd.github+json"];
  // 全量统计 77 个仓库，匿名额度不够；CI 带 token 提到 5000
  if (process.env.GITHUB_TOKEN) headers.push("-H", `Authorization: Bearer ${process.env.GITHUB_TOKEN}`);
  const raw = execFileSync("curl", ["-sS", "-L", "--max-time", "30", ...headers, url], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function fetchRepo(owner, name) {
  return api(`https://api.github.com/repos/${owner}/${name}`);
}

function downloadAvatar(owner, url) {
  const dir = join(process.cwd(), "public", "avatars");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${owner}.png`);
  if (!existsSync(file)) {
    execFileSync("curl", ["-sS", "-L", "--max-time", "20", "-o", file, url], { stdio: "ignore" });
  }
  return `/avatars/${owner}.png`;
}

const iso = (date) => date.toISOString().slice(0, 10);
const quote = (value) => JSON.stringify(value);

function previousStats() {
  const file = join(process.cwd(), "content", "picks", "ai.mdx");
  if (!existsSync(file)) return { entries: new Map(), syncedAt: null };
  try {
    const { data } = matter(readFileSync(file, "utf8"));
    return {
      entries: new Map((data.entries ?? []).map((entry) => [entry.repo.toLowerCase(), entry])),
      syncedAt: data.syncedAt ? new Date(data.syncedAt) : null,
    };
  } catch {
    return { entries: new Map(), syncedAt: null };
  }
}

const today = new Date();
const todayIso = iso(today);
const old = previousStats();
const targets = getAllRepoDetails().map((detail) => detail.data.repo);
const stats = new Map();
let failed = 0;

for (const repo of targets) {
  const [owner, name] = repo.split("/");
  try {
    const data = fetchRepo(owner, name);
    if (!data || data.message) throw new Error(data?.message ?? "API 没有返回仓库");
    const created = new Date(data.created_at);
    const days = Math.max(1, Math.round((Date.now() - created.getTime()) / 86400000));
    stats.set(repo.toLowerCase(), {
      name: data.name,
      repo: data.full_name,
      owner: data.owner.login,
      description: data.description ?? "（仓库没有写简介）",
      language: data.language ?? undefined,
      topics: (data.topics ?? []).slice(0, 6),
      stars: data.stargazers_count,
      forks: data.forks_count,
      starsPerDay: Math.round((data.stargazers_count / days) * 10) / 10,
      createdAt: created,
      pushedAt: new Date(data.pushed_at),
      avatarUrl: data.owner.avatar_url,
    });
  } catch (error) {
    failed += 1;
    const oldEntry = old.entries.get(repo.toLowerCase());
    if (oldEntry) {
      stats.set(repo.toLowerCase(), {
        ...oldEntry,
        avatarUrl: undefined,
        avatar: oldEntry.avatar,
      });
    }
    console.error(`${repo} 统计失败，保留旧值：${error.message}`);
  }
}

if (stats.size === 0) {
  console.error("所有仓库统计都失败，保留上一份快照。");
  process.exit(1);
}

const entries = [...stats.values()].sort((a, b) => a.repo.localeCompare(b.repo));
for (const entry of entries) {
  const oldEntry = old.entries.get(entry.repo.toLowerCase());
  entry.avatar =
    entry.avatarUrl && !dryRun
      ? downloadAvatar(entry.owner, entry.avatarUrl)
      : oldEntry?.avatar;
  entry.why = oldEntry?.why;
}

const historyFile = join(process.cwd(), "content", "picks", "history.json");
const history = existsSync(historyFile) ? JSON.parse(readFileSync(historyFile, "utf8")) : emptyHistory();
const { history: nextHistory, firstSeen } = mergeHistory(
  history,
  entries.map((entry) => entry.repo),
  todayIso,
);
for (const entry of entries) entry.firstSeen = firstSeen[entry.repo];

const yaml = [
  "---",
  `syncedAt: ${iso(today)}`,
  `query: ${quote(`stats for ${targets.length} collected repos`)}`,
  "entries:",
  ...entries.flatMap((entry) => [
    `  - name: ${quote(entry.name)}`,
    `    repo: ${quote(entry.repo)}`,
    `    owner: ${quote(entry.owner)}`,
    ...(entry.avatar ? [`    avatar: ${quote(entry.avatar)}`] : []),
    `    description: ${quote(entry.description)}`,
    ...(entry.language ? [`    language: ${quote(entry.language)}`] : []),
    `    topics: [${entry.topics.map(quote).join(", ")}]`,
    `    stars: ${entry.stars}`,
    `    forks: ${entry.forks}`,
    `    starsPerDay: ${entry.starsPerDay}`,
    `    discoveredVia: ["github"]`,
    `    createdAt: ${iso(entry.createdAt)}`,
    `    pushedAt: ${iso(entry.pushedAt)}`,
    `    firstSeen: ${entry.firstSeen}`,
    ...(entry.why ? [`    why: ${quote(entry.why)}`] : []),
  ]),
  "---",
  "",
].join("\n");

if (dryRun) {
  console.log(`[dry-run] 统计目标 ${targets.length} 个，成功 ${entries.length - failed} 个，失败 ${failed} 个，不写文件。`);
} else {
  const file = join(process.cwd(), "content", "picks", "ai.mdx");
  writeFileSync(file, yaml, "utf8");
  writeFileSync(historyFile, `${JSON.stringify(nextHistory, null, 2)}\n`, "utf8");
  console.log(`写入 ${file}：${entries.length} 个收藏项目的 GitHub 统计，失败 ${failed} 个。`);
}
