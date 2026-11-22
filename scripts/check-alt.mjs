// 扫构建产物里的 <img>：缺 alt 属性就退出码 1，一张图都没有则退出码 2（空集不算通过）。
// 不用 grep：多行 JSX 的 <Image> 会被按行匹配漏掉，空集时也会"通过"。
//
// alt="" 是合法且正确的：头像这类纯装饰图旁边已经有项目名和 owner，
// 再念一遍「xxx 的头像」只是噪音。门禁只要求 alt 属性存在——即做过决定——
// 空值单独计数打出来，避免悄悄变成习惯。
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
let decorative = 0;
const missing = [];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    total += 1;
    const alt = /\balt="([^"]*)"/.exec(tag);
    if (!alt) missing.push(`${relative(ROOT, file)} → ${tag.slice(0, 120)}`);
    else if (alt[1].trim() === "") decorative += 1;
  }
}

if (missing.length > 0) {
  console.error(`有 ${missing.length} 张图没有 alt 属性：`);
  for (const item of missing) console.error(`  - ${item}`);
  process.exit(1);
}

if (total === 0) {
  console.log("构建产物里 0 张 <img>（当前内容没有截图）。空集不算通过，等有图后再跑一次。");
  process.exit(2);
}

console.log(`${total} 张图，全部有 alt 属性；其中 ${decorative} 张标为装饰（alt=""）。`);
