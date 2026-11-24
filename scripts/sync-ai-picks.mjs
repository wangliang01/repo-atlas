// 从 GitHub 搜索 API 抓 AI 相关项目，生成 content/picks/ai.mdx 快照。
// 用 curl 而不是 fetch：Node 的 fetch 不走系统代理。
// 星数、fork、语言、topics、创建/推送时间全是 API 原值；starsPerDay 由 stars ÷ 建仓天数算。
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { selectPicks } from "../lib/discovery.ts";
import { approvedRepos, emptyNominations } from "../lib/nominations.ts";
import { emptyHistory, mergeHistory } from "../lib/picks-history.ts";
import { buildQueries, searchUrl } from "../lib/queries.ts";

// 30 = 8 锚点 + 10 新项目 + 8 动量 + 4 提名 的保底配额之和
const LIMIT = 30;
// 匿名搜索额度 10 次/分钟，9 条 lane 连着打会撞墙；留出间隔
const QUERY_GAP_MS = 700;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function api(url) {
  const headers = ["-H", "Accept: application/vnd.github+json"];
  // 匿名额度只有 60 次/小时，一天跑 4 次会撞上限；CI 里带上 token 提到 5000
  if (process.env.GITHUB_TOKEN) headers.push("-H", `Authorization: Bearer ${process.env.GITHUB_TOKEN}`);
  const raw = execFileSync("curl", ["-sS", "-L", "--max-time", "30", ...headers, url], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function search(query) {
  const json = api(searchUrl(query, 30));
  if (!Array.isArray(json.items)) {
    throw new Error(`搜索失败（${query.id} / ${query.q}）：${json.message ?? "未知错误"}`);
  }
  return json.items;
}

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

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

// why 是手写的判断，API 给不出来。同步会整份重写快照，不先捞出来就会丢
function previousWhys() {
  const file = join(process.cwd(), "content", "picks", "ai.mdx");
  if (!existsSync(file)) return new Map();
  try {
    const { data } = matter(readFileSync(file, "utf8"));
    const pairs = (data.entries ?? []).filter((entry) => entry.why).map((entry) => [entry.repo, entry.why]);
    return new Map(pairs);
  } catch {
    return new Map();
  }
}

const today = new Date();
const queries = buildQueries(today);

// 提名来自头条收藏 / last30days；只有人工改成 approved 才参与分桶
const nominationsFile = join(process.cwd(), "content", "picks", "nominations.json");
const nominations = existsSync(nominationsFile)
  ? JSON.parse(readFileSync(nominationsFile, "utf8"))
  : emptyNominations();
const approved = new Set(approvedRepos(nominations).map((repo) => repo.toLowerCase()));
const sourcesByRepo = new Map();
const notesByRepo = new Map();
for (const [key, item] of Object.entries(nominations.items ?? {})) {
  sourcesByRepo.set(key, [...new Set((item.mentions ?? []).map((mention) => mention.kind))]);
  notesByRepo.set(key, [...new Set((item.mentions ?? []).map((mention) => mention.notePath))]);
}

const candidates = new Map();
let failedQueries = 0;
for (const query of queries) {
  try {
    const items = search(query);
    console.log(`${query.id}: ${items.length} 条（${query.q}）`);
    for (const repo of items) {
      const key = repo.full_name.toLowerCase();
      const previous = candidates.get(key);
      if (!previous || repo.stargazers_count > previous.stars) candidates.set(key, toEntry(repo));
    }
  } catch (error) {
    failedQueries += 1;
    console.error(`${query.id} 失败：${error.message}`);
  }
  sleep(QUERY_GAP_MS);
}

if (failedQueries === queries.length) {
  console.error("所有查询都失败，保留上一份快照。");
  process.exit(1);
}

const entries = selectPicks(
  [...candidates.values()].map((entry) => ({
    ...entry,
    approved: approved.has(entry.repo.toLowerCase()),
  })),
  today,
  LIMIT,
)
  .map((entry) => ({
    ...entry,
    discoveredVia: [...new Set(["github", ...(sourcesByRepo.get(entry.key) ?? [])])],
    sourceNotes: notesByRepo.get(entry.key) ?? [],
  }))
  .sort((a, b) => b.trendScore - a.trendScore);

if (entries.length === 0) {
  console.error("没有抓到条目，检查网络或查询条件。");
  process.exitCode = 1;
} else {
  for (const entry of entries) {
    entry.avatar = dryRun ? undefined : downloadAvatar(entry.owner, entry.avatarUrl);
  }

  const todayIso = iso(today);

  // 首次上榜台账：快照会被整份重写，不单独记就永远不知道谁是新面孔
  const historyFile = join(process.cwd(), "content", "picks", "history.json");
  const history = existsSync(historyFile) ? JSON.parse(readFileSync(historyFile, "utf8")) : emptyHistory();
  const { history: nextHistory, firstSeen, added } = mergeHistory(
    history,
    entries.map((entry) => entry.repo),
    todayIso,
  );
  for (const entry of entries) entry.firstSeen = firstSeen[entry.repo];

  const whys = previousWhys();
  for (const entry of entries) {
    const why = whys.get(entry.repo);
    if (why) entry.why = why;
  }

  const yaml = [
    "---",
    `syncedAt: ${iso(today)}`,
    `query: ${quote(`${queries.length} lanes: ${queries.map((query) => query.id).join(",")}`)}`,
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
      `    bucket: ${entry.bucket}`,
      `    trendScore: ${Math.round(entry.trendScore * 10) / 10}`,
      ...(entry.starsDelta7d !== undefined ? [`    starsDelta7d: ${entry.starsDelta7d}`] : []),
      `    discoveredVia: [${entry.discoveredVia.map(quote).join(", ")}]`,
      ...(entry.sourceNotes.length > 0
        ? [`    sourceNotes: [${entry.sourceNotes.map(quote).join(", ")}]`]
        : []),
      `    createdAt: ${iso(entry.createdAt)}`,
      `    pushedAt: ${iso(entry.pushedAt)}`,
      `    firstSeen: ${entry.firstSeen}`,
      ...(entry.why ? [`    why: ${quote(entry.why)}`] : []),
    ]),
    "---",
    "",
  ].join("\n");

  const byBucket = Object.fromEntries(
    ["fresh", "nominated", "momentum", "anchor"].map((bucket) => [
      bucket,
      entries.filter((entry) => entry.bucket === bucket).length,
    ]),
  );
  if (dryRun) {
    console.log(`[dry-run] 入选 ${entries.length} 条，不写文件。分桶：${JSON.stringify(byBucket)}`);
    for (const entry of entries.slice(0, 5)) {
      console.log(`  ${entry.bucket.padEnd(9)} ${entry.repo} ★${entry.stars} ${entry.trendScore}/天`);
    }
  } else {
    const file = join(process.cwd(), "content", "picks", "ai.mdx");
    writeFileSync(file, yaml, "utf8");
    writeFileSync(historyFile, `${JSON.stringify(nextHistory, null, 2)}\n`, "utf8");
    console.log(`写入 ${file}：${entries.length} 条，分桶 ${JSON.stringify(byBucket)}`);
    console.log(`新上榜 ${added.length} 个${added.length > 0 ? `：${added.join("、")}` : ""}`);
    console.log(`趋势最高：${[...entries].sort((a, b) => b.trendScore - a.trendScore).slice(0, 3).map((e) => `${e.repo} ${e.trendScore}/天`).join(" · ")}`);
  }
}
