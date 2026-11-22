import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { projectFrontmatter } from "./schema.ts";
import { getAdjacentProjects, getAllProjects } from "./content.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("screenshot 可选：没有截图也能通过校验，不再留死路径", () => {
  const withoutShot = {
    name: "X",
    repo: "a/b",
    tagline: "一句话定位",
    verdict: "watch",
    topics: ["t"],
    replaces: [],
    deploy: "docker",
    setupTime: "5min",
    maintenance: "active",
    license: "MIT",
    language: "Go",
    stars: 100,
    publishedAt: "2026-11-01",
    highlight: "h",
    forWho: "f",
    notFor: "n",
    alternatives: [],
  };
  const parsed = projectFrontmatter.safeParse(withoutShot);
  assert.equal(parsed.success, true, "缺少 screenshot 应当仍然合法");

  for (const project of getAllProjects()) {
    assert.equal(project.data.screenshot, undefined, `${project.slug} 仍带着不存在的截图路径`);
  }
});

test("相邻条目：最新一条只有 next，中间那条两边都有", () => {
  const all = getAllProjects();
  assert.ok(all.length >= 3, "至少 3 条才能验相邻关系");

  const newest = getAdjacentProjects(all[0].slug);
  assert.equal(newest.prev, undefined, "最新一条不应有 prev");
  assert.equal(newest.next?.slug, all[1].slug, "next 应指向第二条");

  const middle = getAdjacentProjects(all[1].slug);
  assert.equal(middle.prev?.slug, all[0].slug);
  assert.equal(middle.next?.slug, all[2].slug);

  const last = getAdjacentProjects(all[all.length - 1].slug);
  assert.equal(last.next, undefined, "最后一条不应有 next");
});

test("详情页：静态预渲染 + 元信息 + MDX 渲染 + MetaBar", () => {
  assert.ok(has("app/projects/[slug]/page.tsx"), "详情页不存在");
  const page = read("app/projects/[slug]/page.tsx");
  assert.ok(page.includes("generateStaticParams"), "缺静态参数");
  assert.ok(page.includes("generateMetadata"), "缺元信息");
  assert.ok(page.includes("notFound"), "缺 404 处理");
  assert.ok(page.includes("MetaBar"), "详情页没用 MetaBar");
  assert.ok(page.includes("VerdictBadge"), "详情页没用结论标签");
  assert.ok(page.includes("最后核实于"), "缺最后核实时间");
});

test("正文排版组件：二级标题、段落、代码块各有样式", () => {
  assert.ok(has("components/prose.tsx"), "components/prose.tsx 不存在");
  const prose = read("components/prose.tsx");
  assert.ok(prose.includes("h2"), "缺二级标题样式");
  assert.ok(prose.includes("max-w-[var(--measure)]") || prose.includes("var(--measure)"), "正文列宽没锁 720px");
  assert.ok(prose.includes("code"), "缺代码样式");
});
