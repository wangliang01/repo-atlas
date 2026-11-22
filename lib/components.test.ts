import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("列表行：标题 16px 600 + 两行描述 + 一行 meta，三种行共用一套字号", () => {
  for (const file of ["components/pick-row.tsx", "components/repo-row.tsx", "components/note-card.tsx"]) {
    assert.ok(has(file), `${file} 不存在`);
    const row = read(file);
    assert.ok(row.includes("text-body font-semibold"), `${file} 标题不是 16px 600`);
    assert.ok(row.includes("text-small"), `${file} 描述没用 13px 档`);
    assert.ok(row.includes("text-micro"), `${file} 元信息没用 12px 档`);
    assert.equal(row.includes("font-serif"), false, `${file} 还在用衬线`);
    assert.equal(row.includes("border border-line"), false, `${file} 还是旧的外框卡片写法`);
  }
});

test("区块标题组件：标题 + 可选的右侧动作", () => {
  assert.ok(has("components/section-head.tsx"), "components/section-head.tsx 不存在");
  const head = read("components/section-head.tsx");
  assert.ok(head.includes("h2"), "没有二级标题");
  assert.ok(head.includes("action"), "没有右侧动作入口");
});

test("首页组装：身份卡 + 轨迹 + 笔记，第一屏不是 feed", () => {
  const page = read("app/page.tsx");
  for (const part of ["IdentityCard", "RepoRow", "RisingPanel"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  assert.equal(page.includes("本期"), false, "首页还在用「本期」这个说法");
});
