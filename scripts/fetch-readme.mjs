// 抓 GitHub README 到 .cache/readme/，供写中文详情页时参考。
// 只写缓存，不写 content/；readmeSha 用来发现仓库更新后详情是否过期。
// 用法：node scripts/fetch-readme.mjs <owner/repo> [--dry-run]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const repo = args.find((arg) => !arg.startsWith("--"));
const dryRun = args.includes("--dry-run");

if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
  console.error("用法：node scripts/fetch-readme.mjs <owner/repo> [--dry-run]");
  process.exit(1);
}

const headers = ["-H", "Accept: application/vnd.github+json"];
// 匿名 core API 60 次/小时，批量补详情时带上 token
if (process.env.GITHUB_TOKEN) headers.push("-H", `Authorization: Bearer ${process.env.GITHUB_TOKEN}`);

const raw = execFileSync(
  "curl",
  ["-sS", "-L", "--max-time", "30", ...headers, `https://api.github.com/repos/${repo}/readme`],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);
const json = JSON.parse(raw);
if (!json.content || !json.sha) {
  console.error(`读取失败（${repo}）：${json.message ?? "没有 README"}`);
  process.exit(1);
}

const text = Buffer.from(json.content, "base64").toString("utf8");
const slug = repo.toLowerCase().replace("/", "--");
const dir = join(process.cwd(), ".cache", "readme");
const fetchedAt = new Date().toISOString().slice(0, 10);

console.log(`${repo}  ${json.name}  sha=${json.sha.slice(0, 12)}  ${text.length} 字符`);
if (dryRun) {
  console.log("[dry-run] 不写文件");
} else {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.md`), text, "utf8");
  writeFileSync(
    join(dir, `${slug}.json`),
    `${JSON.stringify({ repo, name: json.name, sha: json.sha, fetchedAt }, null, 2)}\n`,
    "utf8",
  );
  console.log(`写入 .cache/readme/${slug}.md`);
}
