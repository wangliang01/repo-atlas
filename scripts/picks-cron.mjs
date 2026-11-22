// 定时任务入口：同步精选快照，有变化就只提交 content/picks 与 public/avatars。
// 只提交这两个路径，免得把工作区里没写完的改动一起卷进来。
// 没有 remote 就只提交不推送；有 remote 才 push。
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const git = (args, options = {}) => {
  // stdio: "inherit" 时 execFileSync 返回 null，直接 .trim() 会抛错，
  // 把已经成功的 push 误报成失败（第一次在 Actions 上跑就是这么被骗的）
  const out = execFileSync("git", args, { cwd: root, encoding: "utf8", ...options });
  return (out ?? "").trim();
};

const stamp = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

console.log(`[${stamp()}] 开始同步`);

try {
  execFileSync("node", [join(root, "scripts", "sync-ai-picks.mjs")], { cwd: root, stdio: "inherit" });
} catch {
  console.error(`[${stamp()}] 同步失败，本次不提交`);
  process.exit(1);
}

const PATHS = ["content/picks", "public/avatars"];
const changed = git(["status", "--porcelain", "--", ...PATHS]);

if (!changed) {
  console.log(`[${stamp()}] 没有变化`);
  process.exit(0);
}

git(["add", "--", ...PATHS]);
// -- 之后的路径限定：即使工作区别处有暂存内容，也不会被这次提交带走
git(["commit", "-m", `chore(picks): 同步 AI 精选 ${stamp()}`, "--", ...PATHS]);

const remotes = git(["remote"]);
if (remotes) {
  try {
    git(["push"], { stdio: "inherit" });
    console.log(`[${stamp()}] 已推送`);
  } catch {
    console.error(`[${stamp()}] 推送失败，提交已留在本地`);
  }
} else {
  console.log(`[${stamp()}] 没有 remote，只提交不推送`);
}
