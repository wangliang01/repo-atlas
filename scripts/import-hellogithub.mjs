// 从 HelloGitHub 仓库拉某一期的 markdown，解析成精选草稿。
// 只写 .scratch/import/：草稿里 why 是空的，直接进 content/ 会让构建失败。
// 用 curl 而不是 fetch：Node 的 fetch 不走系统代理，这里会被重置连接。
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseHelloGitHub } from "../lib/hellogithub.ts";

const args = process.argv.slice(2);
const fileIndex = args.indexOf("--file");
const localFile = fileIndex === -1 ? null : args[fileIndex + 1];
const withStars = args.includes("--stars");
const issue = Number(args.find((arg) => /^\d+$/.test(arg)));

// 星数不要凭印象填：要么不填，要么从 GitHub API 拿真数
function repoMeta(repo) {
  try {
    const json = execFileSync(
      "curl",
      ["-sS", "-L", "--max-time", "15", "-H", "Accept: application/vnd.github+json", `https://api.github.com/repos/${repo}`],
      { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
    );
    const data = JSON.parse(json);
    if (typeof data.stargazers_count !== "number") return null;
    return { stars: data.stargazers_count, language: typeof data.language === "string" ? data.language : undefined };
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function load(issueNumber) {
  if (localFile) return readFileSync(localFile, "utf8");

  const source = `https://raw.githubusercontent.com/521xueweihan/HelloGitHub/master/content/HelloGitHub${issueNumber}.md`;
  try {
    return execFileSync("curl", ["-sS", "-L", "--max-time", "30", source], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(
      `拉取失败（${source}）：${error.message}\n可以手动下载这个文件，然后跑 pnpm import:hg ${issueNumber} --file <路径>`,
    );
  }
}

function draftFor(issueNumber, entries) {
  const quote = (value) => JSON.stringify(value);
  const today = new Date();
  const publishedAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return [
    "---",
    `issue: ${issueNumber}`,
    `publishedAt: ${publishedAt}`,
    "entries:",
    ...entries.flatMap((entry) => [
      `  - name: ${quote(entry.name)}`,
      `    repo: ${quote(entry.repo)}`,
      `    category: ${quote(entry.category)}`,
      `    tagline: ${quote(entry.tagline)}`,
      '    why: ""',
      ...(entry.stars === undefined ? [] : [`    stars: ${entry.stars}`]),
      ...(entry.language === undefined ? [] : [`    language: ${quote(entry.language)}`]),
    ]),
    "---",
    "",
    `<!-- 草稿：来自 HelloGitHub 第 ${issueNumber} 期。只留你要的条目，把 why 写成你自己的判断，再移动到 content/picks/hellogithub-${issueNumber}.mdx -->`,
    "",
  ].join("\n");
}

if (!Number.isInteger(issue) || issue <= 0) {
  fail("用法：pnpm import:hg <期号> [--file <本地 md 路径>]，例如 pnpm import:hg 100");
} else {
  try {
    const { entries, skipped } = parseHelloGitHub(load(issue));

    if (entries.length === 0) {
      fail("没有解析到条目。HelloGitHub 的格式可能变了，先人工看一眼源文件。");
    } else {
      if (withStars) {
        let enriched = 0;
        for (const entry of entries) {
          const meta = repoMeta(entry.repo);
          if (meta) {
            entry.stars = meta.stars;
            entry.language = meta.language;
            enriched += 1;
          }
        }
        console.log(`星数/语言：${enriched}/${entries.length} 条取到（GitHub API 匿名限流 60 次/小时）`);
      }

      const outDir = join(process.cwd(), ".scratch", "import");
      mkdirSync(outDir, { recursive: true });
      const outFile = join(outDir, `hellogithub-${issue}.mdx`);
      writeFileSync(outFile, draftFor(issue, entries), "utf8");

      const byCategory = new Map();
      for (const entry of entries) {
        byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + 1);
      }

      console.log(`第 ${issue} 期：${entries.length} 条，写入 ${outFile}`);
      console.log(`分类：${[...byCategory].map(([name, count]) => `${name} ${count}`).join(" · ")}`);
      if (skipped > 0) console.log(`跳过 ${skipped} 条（不是 GitHub 仓库）`);
      console.log("下一步：删掉不要的条目，给留下的写 why，然后移到 content/picks/。");
    }
  } catch (error) {
    fail(error.message);
  }
}
