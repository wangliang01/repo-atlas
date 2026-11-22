import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getPicksSnapshot } from "./content.ts";
import {
  ALL_CATEGORIES,
  filterPicks,
  formatPerDay,
  pickBuckets,
  pickCategories,
  RISING_TOP,
  risingRepos,
} from "./picks.ts";
import type { PickLike } from "./picks.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

let seq = 0;
const like = (over: Partial<PickLike> = {}): PickLike => ({
  repo: `owner/repo-${++seq}`,
  topics: [],
  description: "",
  stars: 0,
  starsPerDay: 0,
  ...over,
});

test("分桶：topics 和简介都参与，命中多个就进多个桶", () => {
  assert.deepEqual(pickBuckets(like({ topics: ["ai", "agent"] })), ["Agent"]);
  assert.deepEqual(pickBuckets(like({ description: "MCP server for a CLI tool" })), ["MCP", "工具"]);
  assert.deepEqual(pickBuckets(like({ topics: ["agent-skills"], description: "" })), ["Agent", "Skill"]);
});

test("分桶：词界要挡住假命中，build 里的 ui 不算工具", () => {
  assert.deepEqual(pickBuckets(like({ description: "A build system for storage" })), ["其它"]);
  assert.deepEqual(pickBuckets(like({ description: "UI for chat" })), ["工具"]);
});

test("分类：全部排第一，只出非空的，计数按全集", () => {
  const entries = [
    like({ topics: ["agent"] }),
    like({ topics: ["mcp"] }),
    like({ topics: ["ai"] }),
  ];

  const categories = pickCategories(entries);
  assert.deepEqual(
    categories.map((category) => category.label),
    [ALL_CATEGORIES, "Agent", "MCP", "其它"],
  );
  assert.equal(categories[0].count, 3, "「全部」的计数应该是全集");
  for (const category of categories) {
    assert.ok(category.count > 0, `${category.label} 是空分类`);
  }
});

test("涨得快：取 stars/天 最高的前 10 个，不是固定阈值", () => {
  // 全部都在 15 星/天以上：阈值写法会把这 26 个全算进去，开关就等于没有
  const entries = Array.from({ length: 26 }, (_, i) => like({ starsPerDay: 2000 - i * 10 }));
  const rising = risingRepos(entries);

  assert.equal(rising.size, RISING_TOP);
  assert.ok(rising.has(entries[0].repo), "最快的那个没进去");
  assert.equal(rising.has(entries[RISING_TOP].repo), false, "第 11 名不该进去");
});

test("双轴过滤：分类和涨得快正交，交集数字对得上", () => {
  // 前 6 个是 Agent，后 6 个是 MCP；stars/天 从 100 递减。
  // 前 10 名 = 6 个 Agent + 4 个 MCP，所以 MCP × 涨得快 应该剩 4。
  const entries = [
    ...Array.from({ length: 6 }, (_, i) => like({ topics: ["agent"], starsPerDay: 100 - i })),
    ...Array.from({ length: 6 }, (_, i) => like({ topics: ["mcp"], starsPerDay: 94 - i })),
  ];

  const count = (category: string, risingOnly: boolean) =>
    filterPicks(entries, { category, risingOnly }).length;

  assert.equal(count(ALL_CATEGORIES, false), 12);
  assert.equal(count(ALL_CATEGORIES, true), 10);
  assert.equal(count("Agent", false), 6);
  assert.equal(count("Agent", true), 6);
  assert.equal(count("MCP", false), 6);
  assert.equal(count("MCP", true), 4);
});

test("双轴过滤：不认识的分类返回空，不会退化成全部", () => {
  const entries = [like({ topics: ["agent"] })];
  assert.equal(filterPicks(entries, { category: "不存在的分类", risingOnly: false }).length, 0);
});

test("涨速格式：整数不拖小数，小数保留一位", () => {
  assert.equal(formatPerDay(2130.3), "+2130/天");
  assert.equal(formatPerDay(4.25), "+4.3/天");
});

test("真实快照：字段齐全，头像文件真的在 public 里", () => {
  const snapshot = getPicksSnapshot();
  assert.ok(snapshot, "content/picks 里没有快照");
  assert.ok(snapshot.entries.length >= 1, "快照里没有条目");
  assert.ok(!Number.isNaN(snapshot.syncedAt.getTime()), "syncedAt 不是有效日期");

  for (const entry of snapshot.entries) {
    assert.match(entry.repo, /^[\w.-]+\/[\w.-]+$/, `${entry.name} 的 repo 写法不对`);
    assert.equal(entry.repo.split("/")[0], entry.owner, `${entry.name} 的 owner 和 repo 前缀不一致`);
    assert.ok(entry.stars >= 0, `${entry.name} 的 stars 是负数`);
    if (entry.avatar) {
      assert.ok(has(`public${entry.avatar}`), `${entry.name} 指向的头像 ${entry.avatar} 不存在，构建会失败`);
    }
  }
});

test("真实快照：stars 倒序，不出现重复仓库", () => {
  const entries = getPicksSnapshot()?.entries ?? [];
  const stars = entries.map((entry) => entry.stars);
  assert.deepEqual(stars, [...stars].sort((a, b) => b - a), "快照没有按 stars 倒序");
  assert.equal(new Set(entries.map((e) => e.repo)).size, entries.length, "快照里有重复仓库");
});

test("互链：站内已经没有评测页，精选行只走 GitHub", () => {
  // T-014 删掉了三条代写评测，「已跑过」入口跟着没了
  assert.equal(has("app/projects"), false, "评测路由不该再存在");
  assert.equal(read("components/pick-row.tsx").includes("/projects/"), false, "精选行还在链评测页");
});

test("页面与脚本：/picks 存在、进了导航、同步脚本在", () => {
  assert.ok(has("app/picks/page.tsx"), "缺 /picks 页面");
  assert.ok(has("components/pick-row.tsx"), "缺列表行组件");
  assert.ok(has("scripts/sync-ai-picks.mjs"), "缺同步脚本");
  assert.ok(read("components/site-header.tsx").includes('"/picks"'), "导航里没有精选");
  assert.ok(read("package.json").includes("sync:picks"), "package.json 没注册 sync:picks");
});
