import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("项目列表页已删除，详情页还在", () => {
  assert.equal(has("app/projects/page.tsx"), false, "列表页应该并进首页了");
  assert.ok(has("app/projects/[slug]/page.tsx"), "详情页不能一起删");
});

test("老链接 /projects 有 308 兜底，不是 404", () => {
  const config = read("next.config.ts");
  assert.ok(config.includes('source: "/projects"'), "缺 /projects 重定向");
  assert.ok(config.includes('destination: "/"'), "重定向目标不是首页");
  assert.ok(config.includes("permanent: true"), "不是永久重定向");
});

test("旧的精选列表组件已删除，没有两套行渲染", () => {
  assert.equal(has("components/pick-list.tsx"), false, "pick-list 应该拆成 pick-row + picks-view");
  assert.ok(has("components/pick-row.tsx"), "缺 pick-row");
  assert.ok(has("components/picks-view.tsx"), "缺 picks-view");
});
