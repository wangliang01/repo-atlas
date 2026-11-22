// 从 GitHub 搜索 API 抓 AI 相关项目，生成 content/picks/ai.mdx 快照。
// 用 curl 而不是 fetch：Node 的 fetch 不走系统代理。
// 星数、fork、语言、topics、创建/推送时间全是 API 原值；starsPerDay 由 stars ÷ 建仓天数算。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const STAR_QUERY = "topic:ai stars:>8000";
// GitHub 的 created: 只认日期，不认 6months 这种相对写法
const SIX_MONTHS_AGO = new Date(Date.now() - 183 * 86400000).toISOString().slice(0, 10);
const RISING_QUERY = `topic:ai created:>${SIX_MONTHS_AGO} stars:>500`;
const LIMIT = 24;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function api(url) {
  const raw = execFileSync("curl", ["-sS", "-L", "--max-time", "30", "-H", "Accept: application/vnd.github+json", url], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function search(query, sort) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=30`;
  const json = api(url);
  if (!Array.isArray(json.items)) {
    throw new Error(`搜索失败（${query}）：${json.message ?? "未知错误"}`);
  }
  return json.items;
}

function toEntry(repo) {
  const created = new Date(repo.created_at);
  const days = Math.max(1, Math.round((Date.now() - created.getTime()) / 86400000));
  return {
    name: repo.name,
    repo: repo.full_name,
    owner: repo.owner.login,
    description: (repo.description ?? "（仓库没有写简介）").replace(/\s+/g, " ").trim(),
    language: repo.language ?? undefined,
    topics: (repo.topics ?? []).slice(0, 6),
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    starsPerDay: Math.round((repo.stargazers_count / days) * 10) / 10,
    createdAt: created,
    pushedAt: new Date(repo.pushed_at),
    avatarUrl: repo.owner.avatar_url,
  };
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

console.log(`搜索：${STAR_QUERY} / ${RISING_QUERY}`);
const byStars = search(STAR_QUERY, "stars");
const rising = search(RISING_QUERY, "stars");

const merged = new Map();
for (const repo of [...byStars, ...rising]) {
  if (!merged.has(repo.full_name)) merged.set(repo.full_name, toEntry(repo));
}

const all = [...merged.values()];
const topStars = [...all].sort((a, b) => b.stars - a.stars).slice(0, LIMIT);
const topRising = [...all].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, 10);

const picked = new Map();
for (const entry of [...topStars, ...topRising]) picked.set(entry.repo, entry);
const entries = [...picked.values()].sort((a, b) => b.stars - a.stars);

if (entries.length === 0) {
  console.error("没有抓到条目，检查网络或查询条件。");
  process.exitCode = 1;
} else {
  for (const entry of entries) {
    entry.avatar = dryRun ? undefined : downloadAvatar(entry.owner, entry.avatarUrl);
  }

  const today = new Date();
  const yaml = [
    "---",
    `syncedAt: ${iso(today)}`,
    `query: ${quote(`${STAR_QUERY} | ${RISING_QUERY}`)}`,
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
      `    createdAt: ${iso(entry.createdAt)}`,
      `    pushedAt: ${iso(entry.pushedAt)}`,
    ]),
    "---",
    "",
  ].join("\n");

  if (dryRun) {
    console.log(`[dry-run] 抓到 ${entries.length} 条，不写文件。前 3 条：`);
    for (const entry of entries.slice(0, 3)) {
      console.log(`  ${entry.repo} ★${entry.stars} ${entry.starsPerDay}/天 ${entry.description.slice(0, 40)}`);
    }
  } else {
    const file = join(process.cwd(), "content", "picks", "ai.mdx");
    writeFileSync(file, yaml, "utf8");
    console.log(`写入 ${file}：${entries.length} 条（高星 ${topStars.length} + 涨得快 ${topRising.length}，去重后）`);
    console.log(`涨得最快：${[...entries].sort((a, b) => b.starsPerDay - a.starsPerDay).slice(0, 3).map((e) => `${e.repo} +${e.starsPerDay}/天`).join(" · ")}`);
  }
}
