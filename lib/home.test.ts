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

test("首页是收藏库：身份卡、站点口号、最近在写、笔记区块都撤掉", () => {
  const page = read("app/page.tsx");
  assert.ok(page.includes("<PicksView"), "首页没有收藏库 feed");
  assert.equal((page.match(/我收藏的 GitHub 项目/g) ?? []).length, 1, "收藏库标题不在 sr-only h1 里");
  assert.ok(page.includes("getAllRepoDetails"), "首页没有用全部详情页当收藏全集");
  for (const gone of [
    "<IdentityCard",
    "<RepoRow",
    "最近值得看的 AI 项目",
    'id="repos"',
    'id="notes"',
    "最近在写",
    "IdentityCard",
    "REPOS",
  ]) {
    assert.equal(page.includes(gone), false, `首页不该再有 ${gone}`);
  }
  assert.equal(has("components/identity-card.tsx"), false, "身份卡组件还在");
  assert.equal(has("components/repo-row.tsx"), false, "最近在写的行组件还在");
});

test("假评测已经删干净：内容、路由、组件都不在", () => {
  assert.equal(has("content/projects"), false, "content/projects 还在");
  assert.equal(has("app/projects"), false, "app/projects 路由还在");
  for (const file of [
    "components/project-lead.tsx",
    "components/verdict-badge.tsx",
    "components/verdict-note.tsx",
    "components/about-site.tsx",
    "components/meta-bar.tsx",
    "components/project-row.tsx",
    "components/topic-chip.tsx",
    "components/empty-issue.tsx",
  ]) {
    assert.equal(has(file), false, `${file} 还留着`);
  }
});

