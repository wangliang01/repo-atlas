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

test("首页只剩精选：身份卡、站点口号、最近在写、笔记区块都撤掉", () => {
  const page = read("app/page.tsx");
  assert.ok(page.includes("<PicksView"), "首页没有精选 feed");
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
    // 标题只允许出现在 sr-only 的 h1 里，不能回到可见的 slogan 区块
    if (gone === "最近值得看的 AI 项目") {
      assert.equal((page.match(/最近值得看的 AI 项目/g) ?? []).length, 1, "口号回到了可见区域");
      continue;
    }
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

