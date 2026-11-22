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

test("这个站本身：只写能当场验证的东西，不写形容词", () => {
  assert.ok(has("components/about-site.tsx"), "components/about-site.tsx 不存在");
  const about = read("components/about-site.tsx");
  for (const part of ["静态页面", "单元测试", "实测项目", "公开仓库"]) {
    assert.ok(about.includes(part), `缺少事实项 ${part}`);
  }
  assert.ok(about.includes("Zod"), "没提构建期校验");
  assert.ok(about.includes("AI"), "没交代代码是跟 AI 结对写的");
});

test("空状态：没有内容时显示第一期正在写", () => {
  assert.ok(has("components/empty-issue.tsx"), "components/empty-issue.tsx 不存在");
  const e = read("components/empty-issue.tsx");
  assert.ok(e.includes("第一期正在写"), "空状态缺文案");
});

test("首页组装：身份卡 + 四块内容 + 空状态", () => {
  const page = read("app/page.tsx");
  for (const part of ["<IdentityCard", "<AboutSite", "<ProjectLead", "<RepoRow", "<EmptyIssue"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  for (const anchor of ['id="site"', 'id="picked"', 'id="repos"', 'id="notes"']) {
    assert.ok(page.includes(anchor), `首页缺锚点 ${anchor}`);
  }
  assert.equal(page.includes('"/projects"'), false, "首页不该再链到已删除的列表页");
});
