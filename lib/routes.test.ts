import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("项目路由整条删掉：列表页和详情页都不在", () => {
  assert.equal(has("app/projects/page.tsx"), false, "项目列表页还在");
  // T-014：三条评测是代写的假内容，详情页跟着一起删
  assert.equal(has("app/projects/[slug]/page.tsx"), false, "项目详情页还在");
  assert.equal(has("content/projects"), false, "content/projects 还在");
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
