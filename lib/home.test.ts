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

test("masthead：一条 28px 自述句 + 右侧期号与日期，不再是 40px 大标题", () => {
  assert.ok(has("components/masthead.tsx"), "components/masthead.tsx 不存在");
  const s = read("components/masthead.tsx");
  assert.ok(s.includes("我跑过的开源项目，和它们的真实成色。"), "缺主张文案");
  assert.ok(s.includes("每周 3 个，跑不通的不写。"), "缺承诺句");
  assert.ok(s.includes("text-display"), "主张没用 display 字号");
  assert.equal(s.includes("font-serif"), false, "主张还在用衬线");
  assert.ok(s.includes("tabular-nums"), "日期没用等宽数字");
  assert.ok(/data-testid="masthead"/.test(s), "缺 data-testid=masthead（验收要量它）");
  assert.ok(s.includes("本期 · No."), "缺本期编号");
  assert.equal(has("components/statement.tsx"), false, "旧的 statement.tsx 还在");
});

test("空状态：没有内容时显示第一期正在写", () => {
  assert.ok(has("components/empty-issue.tsx"), "components/empty-issue.tsx 不存在");
  const e = read("components/empty-issue.tsx");
  assert.ok(e.includes("第一期正在写"), "空状态缺文案");
});

test("首页组装了 masthead 与空状态", () => {
  const page = read("app/page.tsx");
  assert.ok(page.includes("<Masthead"), "首页没渲染 Masthead");
  assert.ok(page.includes("<EmptyIssue"), "首页没渲染 EmptyIssue");
  assert.ok(page.includes("wrap"), "首页没套容器");
});
