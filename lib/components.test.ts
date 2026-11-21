import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getAllProjects } from "./content.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("结论标签：三种结论文案不同，别碰带删除线，推荐用强调色", () => {
  assert.ok(has("components/verdict-badge.tsx"), "components/verdict-badge.tsx 不存在");
  const badge = read("components/verdict-badge.tsx");
  for (const label of ["推荐", "观望", "别碰"]) {
    assert.ok(badge.includes(label), `缺结论文案 ${label}`);
  }
  assert.ok(badge.includes("line-through"), "别碰没加删除线");
  assert.ok(badge.includes("bg-accent"), "推荐没用强调色底");
  assert.ok(/verdict/.test(badge), "没有 verdict prop");
});

test("ProjectRow：72px 行高 + 40px 图标 + 三档字号", () => {
  assert.ok(has("components/project-row.tsx"), "components/project-row.tsx 不存在");
  const row = read("components/project-row.tsx");
  assert.ok(row.includes("h-[72px]"), "行高不是 72px");
  assert.ok(row.includes("size-10"), "图标不是 40px");
  assert.ok(row.includes("text-body"), "标题没用 16px");
  assert.ok(row.includes("text-small"), "描述没用 13px 档");
  assert.ok(row.includes("text-micro"), "元数据没用 12px 档");
  assert.ok(row.includes("/projects/"), "行没链到详情页");
});

test("ProjectCard：16:10 画面 + 结论 + 上手时间", () => {
  assert.ok(has("components/project-card.tsx"), "components/project-card.tsx 不存在");
  const card = read("components/project-card.tsx");
  assert.ok(card.includes("aspect-[16/10]"), "画面不是 16:10");
  assert.ok(card.includes("VerdictBadge"), "卡片没放结论标签");
  assert.ok(card.includes("setupTime"), "卡片没显示上手时间");
  assert.ok(card.includes("/projects/"), "卡片没链到详情页");
});

test("区块标题组件：标题 + 可选的右侧动作", () => {
  assert.ok(has("components/section-head.tsx"), "components/section-head.tsx 不存在");
  const head = read("components/section-head.tsx");
  assert.ok(head.includes("h2"), "没有二级标题");
  assert.ok(head.includes("action"), "没有右侧动作入口");
});

test("首页组装：本期卡片 + 最新收录行", () => {
  const page = read("app/page.tsx");
  for (const part of ["ProjectCard", "ProjectRow", "SectionHead", "本期", "最新收录"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
});

test("内容至少 3 个项目，才能验「本期 3 个」", () => {
  const count = getAllProjects().length;
  assert.ok(count >= 3, `项目数 ${count} < 3`);
});
