import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { getAllProjects } from "./content.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("结论标签：三种结论文案不同，别碰带删除线，推荐用强调色", () => {
  assert.ok(has("components/verdict-badge.tsx"), "components/verdict-badge.tsx 不存在");
  const labels = read("lib/labels.ts");
  for (const label of ["推荐", "观望", "别碰"]) {
    assert.ok(labels.includes(label), `缺结论文案 ${label}`);
  }
  const badge = read("components/verdict-badge.tsx");
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

test("ProjectLead：序号 + 结论 + 上手时间，不再用占位截图框", () => {
  assert.ok(has("components/project-lead.tsx"), "components/project-lead.tsx 不存在");
  const lead = read("components/project-lead.tsx");
  assert.ok(lead.includes("VerdictBadge"), "条目没放结论标签");
  assert.ok(lead.includes("setupTime"), "条目没显示上手时间");
  assert.ok(lead.includes("/projects/"), "条目没链到详情页");
  assert.ok(lead.includes("padStart(2"), "没有两位序号");
  // NO.01 那种空框在截图里像图没加载，已删掉，别再回来
  assert.equal(has("components/project-card.tsx"), false, "占位截图卡片又出现了");
  assert.equal(lead.includes("aspect-["), false, "不要再用固定比例的空框");
});

test("区块标题组件：标题 + 可选的右侧动作", () => {
  assert.ok(has("components/section-head.tsx"), "components/section-head.tsx 不存在");
  const head = read("components/section-head.tsx");
  assert.ok(head.includes("h2"), "没有二级标题");
  assert.ok(head.includes("action"), "没有右侧动作入口");
});

test("首页组装：三栏壳 + 主张 + 本期条目，不再重复列一遍同样的项目", () => {
  const page = read("app/page.tsx");
  for (const part of ["SiteShell", "Statement", "ProjectLead", "HomeRail", "ProfileCard", "本期"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  assert.equal(page.includes('"/projects"'), false, "首页不该再链到已删除的列表页");
  // 本期取 slice(0,3)，「更早」必须从 3 之后开始，否则同一批项目出现两次
  assert.ok(page.includes("projects.slice(3)"), "「更早」没有跳过本期三个");
});

test("内容至少 3 个项目，才能验「本期 3 个」", () => {
  const count = getAllProjects().length;
  assert.ok(count >= 3, `项目数 ${count} < 3`);
});
