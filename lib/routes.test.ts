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
  // T-019 起 output: "export"，next.config 的 redirects() 不生效，308 挪到 Caddy 发。
  // 断言跟着行为走：查的是部署配置，不是 next.config
  const caddy = read("deploy/Caddyfile");
  assert.match(caddy, /^\s*redir \/projects \/ 308$/m, "Caddy 里缺 /projects → / 的 308");
});

test("旧的精选列表组件已删除，没有两套行渲染", () => {
  assert.equal(has("components/pick-list.tsx"), false, "pick-list 应该拆成 pick-row + picks-view");
  assert.ok(has("components/pick-row.tsx"), "缺 pick-row");
  assert.ok(has("components/picks-view.tsx"), "缺 picks-view");
});
