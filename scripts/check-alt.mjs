// 扫构建产物里的 <img>，任何一张没有非空 alt 就退出码 1。
// 不用 grep：多行 JSX 的 <Image> 会被按行匹配漏掉，空集时也会"通过"。
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), ".next", "server", "app");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(ROOT);
} catch {
  console.error(`没有找到构建产物：${ROOT}。先跑 pnpm build。`);
  process.exit(1);
}

let total = 0;
const missing = [];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    total += 1;
    const alt = /\balt="([^"]*)"/.exec(tag);
    if (!alt || alt[1].trim() === "") missing.push(`${relative(ROOT, file)} → ${tag.slice(0, 120)}`);
  }
}

if (missing.length > 0) {
  console.error(`有 ${missing.length} 张图缺 alt：`);
  for (const item of missing) console.error(`  - ${item}`);
  process.exit(1);
}

if (total === 0) {
  console.log("构建产物里 0 张 <img>（当前内容没有截图）。空集不算通过，等有图后再跑一次。");
  process.exit(2);
}

console.log(`${total} 张图，全部有非空 alt。`);
