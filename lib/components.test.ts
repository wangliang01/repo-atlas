import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getAllProjects } from "./content.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("结论标签：三种结论文案不同，别碰带删除线，推荐用蓝底", () => {
  assert.ok(has("components/verdict-badge.tsx"), "components/verdict-badge.tsx 不存在");
  const labels = read("lib/labels.ts");
  for (const label of ["推荐", "观望", "别碰"]) {
    assert.ok(labels.includes(label), `缺结论文案 ${label}`);
  }
  const badge = read("components/verdict-badge.tsx");
  assert.ok(badge.includes("line-through"), "别碰没加删除线");
  assert.ok(badge.includes("bg-accent-fill"), "推荐没用蓝底（#1e80ff 压白字只有 3.76:1，必须用深一档）");
  assert.ok(/verdict/.test(badge), "没有 verdict prop");
});

test("列表行：标题 16px 600 + 两行描述 + 一行 meta，四条行共用一套字号", () => {
  for (const file of [
    "components/pick-row.tsx",
    "components/project-lead.tsx",
    "components/project-row.tsx",
    "components/note-card.tsx",
  ]) {
    assert.ok(has(file), `${file} 不存在`);
    const row = read(file);
    assert.ok(row.includes("text-body font-semibold"), `${file} 标题不是 16px 600`);
    assert.ok(row.includes("text-small"), `${file} 描述没用 13px 档`);
    assert.ok(row.includes("text-micro"), `${file} 元信息没用 12px 档`);
    assert.equal(row.includes("font-serif"), false, `${file} 还在用衬线`);
    assert.equal(row.includes("border border-line"), false, `${file} 还是旧的外框卡片写法`);
  }
});

test("ProjectLead：结论 + 上手时间 + 星数，不再用占位截图框", () => {
  const lead = read("components/project-lead.tsx");
  assert.ok(lead.includes("VerdictBadge"), "条目没放结论标签");
  assert.ok(lead.includes("setupTime"), "条目没显示上手时间");
  assert.ok(lead.includes("/projects/"), "条目没链到详情页");
  // 本期编号随「本期」一起删了，首页现在按「这站 / 评测 / 轨迹 / 笔记」分区
  assert.equal(lead.includes("padStart(2"), false, "序号又回来了");
  assert.equal(has("components/project-card.tsx"), false, "占位截图卡片又出现了");
  assert.equal(lead.includes("aspect-["), false, "不要再用固定比例的空框");
});

test("区块标题组件：标题 + 可选的右侧动作", () => {
  assert.ok(has("components/section-head.tsx"), "components/section-head.tsx 不存在");
  const head = read("components/section-head.tsx");
  assert.ok(head.includes("h2"), "没有二级标题");
  assert.ok(head.includes("action"), "没有右侧动作入口");
});

test("首页组装：身份卡 + 这站 + 评测 + 轨迹 + 笔记，第一屏不是 feed", () => {
  const page = read("app/page.tsx");
  for (const part of ["IdentityCard", "AboutSite", "ProjectLead", "RepoRow", "VerdictNote"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  assert.equal(page.includes("本期"), false, "首页还在用「本期」这个说法");
});

test("内容至少 3 个项目，才能验「本期 3 个」", () => {
  const count = getAllProjects().length;
  assert.ok(count >= 3, `项目数 ${count} < 3`);
});
