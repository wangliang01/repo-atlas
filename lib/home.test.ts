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

test("身份卡：真名 + 定位 + 城市状态 + 技术栈，第一屏就知道这是谁", () => {
  assert.ok(has("components/identity-card.tsx"), "components/identity-card.tsx 不存在");
  const card = read("components/identity-card.tsx");
  for (const part of ["text-display", "headline", "location", "status", "stack", "links"]) {
    assert.ok(card.includes(part), `身份卡缺 ${part}`);
  }
  assert.ok(/data-testid="identity"/.test(card), "缺 data-testid=identity（验收要量它）");
  // 375px 下头像和文字必须上下堆叠：并排时文字只剩 223px，定位句会掉出一个孤字
  const row = card.match(/<div className="[^"]*flex-1[^"]*">/)?.[0] ?? "";
  assert.ok(row.includes("flex-col"), "身份卡在手机宽度要 flex-col 堆叠头像与文字");
  assert.ok(row.includes("sm:flex-row"), "身份卡宽屏要 sm:flex-row 恢复并排");
  assert.equal(has("components/masthead.tsx"), false, "旧的 masthead.tsx 还在");
});

test("首页只留三块：身份卡 + 最近在写 + 笔记", () => {
  const page = read("app/page.tsx");
  for (const part of ["<IdentityCard", "<RepoRow", "<RisingPanel"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  for (const anchor of ['id="repos"', 'id="notes"']) {
    assert.ok(page.includes(anchor), `首页缺锚点 ${anchor}`);
  }
  // T-014：介绍站点自己、以及代写的三条评测都撤掉了，别再挂回来
  for (const gone of ["<AboutSite", "<ProjectLead", "<VerdictNote", 'id="site"', 'id="picked"']) {
    assert.equal(page.includes(gone), false, `首页不该再有 ${gone}`);
  }
  assert.equal(page.includes('"/projects"'), false, "首页不该再链到已删除的列表页");
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

