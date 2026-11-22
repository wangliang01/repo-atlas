import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("日期格式为 YYYY.MM.DD，月日补零", async () => {
  assert.ok(has("lib/date.ts"), "lib/date.ts 不存在");
  const src = read("lib/date.ts");
  assert.match(src, /export function formatDate/, "缺 formatDate 导出");
  assert.match(src, /padStart\(2, "0"\)/, "月/日没有补零");
});

test("主张区：40px 宋体标题 + 两行说明 + 本期编号与日期", () => {
  assert.ok(has("components/statement.tsx"), "components/statement.tsx 不存在");
  const s = read("components/statement.tsx");
  assert.ok(s.includes("我跑过的开源项目，和它们的真实成色。"), "缺主张文案");
  assert.ok(s.includes("每周 3 个，跑不通的不写。"), "缺第一行说明");
  assert.ok(s.includes("前端出身，正在往全栈和 AI 应用走。"), "缺第二行说明");
  assert.ok(s.includes("text-display"), "主张没用 display 字号");
  assert.ok(s.includes("font-serif"), "主张没用宋体");
  assert.ok(s.includes("tabular-nums"), "日期没用等宽数字");
  assert.ok(/data-testid="statement"/.test(s), "缺 data-testid=statement（验收要量它）");
  assert.ok(s.includes("本期 · No."), "缺本期编号");
});

test("空状态：没有内容时显示第一期正在写", () => {
  assert.ok(has("components/empty-issue.tsx"), "components/empty-issue.tsx 不存在");
  const e = read("components/empty-issue.tsx");
  assert.ok(e.includes("第一期正在写"), "空状态缺文案");
});

test("首页组装了主张区与空状态", () => {
  const page = read("app/page.tsx");
  assert.ok(page.includes("<Statement"), "首页没渲染 Statement");
  assert.ok(page.includes("<EmptyIssue"), "首页没渲染 EmptyIssue");
  assert.ok(page.includes("wrap"), "首页没套容器");
});
