import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getPicksSnapshot } from "./content.ts";
import {
  filterPicks,
  formatPerDay,
  formatShortDate,
  formatStars,
  pickBuckets,
  pickTabs,
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

test("涨得快：取 stars/天 最高的前 10 个，不是固定阈值", () => {
  // 全部都在 15 星/天以上：阈值写法会把这 26 个全算进去，tab 就等于「全部」
  const entries = Array.from({ length: 26 }, (_, i) => like({ starsPerDay: 2000 - i * 10 }));
  const rising = risingRepos(entries);

  assert.equal(rising.size, RISING_TOP);
  assert.ok(rising.has(entries[0].repo), "最快的那个没进去");
  assert.equal(rising.has(entries[RISING_TOP].repo), false, "第 11 名不该进去");
});

test("tab：count 和筛选结果对得上，且点进去不为空", () => {
  const entries = [
    like({ topics: ["agent"], stars: 30000, starsPerDay: 30 }),
    like({ topics: ["mcp"], stars: 500, starsPerDay: 1 }),
    like({ topics: ["ai"], stars: 100, starsPerDay: 0 }),
  ];

  const tabs = pickTabs(entries);
  assert.deepEqual(
    tabs.map((tab) => tab.label),
    ["全部", "Agent", "MCP", "其它"],
    "tab 顺序或出现条件不对",
  );

  for (const tab of tabs) {
    const visible = filterPicks(entries, tab.label);
    assert.equal(visible.length, tab.count, `${tab.label} 的 count 和实际筛选结果不一致`);
    assert.ok(visible.length > 0, `${tab.label} 是空 tab`);
  }
});

test("tab：条目太少时不出「涨得快」；不再有重复的「高星」", () => {
  const few = [like({ topics: ["agent"], stars: 999999, starsPerDay: 0.4 })];
  assert.equal(pickTabs(few).some((tab) => tab.label === "涨得快"), false);

  const many = Array.from({ length: RISING_TOP + 1 }, (_, i) => like({ starsPerDay: i }));
  const labels = pickTabs(many).map((tab) => tab.label);
  assert.ok(labels.includes("涨得快"));
  assert.equal(labels.includes("高星"), false, "「高星」和按 stars 排序的「全部」重复了");
});

test("数字格式：k / M 进位不出现 1000.0k", () => {
  assert.equal(formatStars(999), "999");
  assert.equal(formatStars(1000), "1.0k");
  assert.equal(formatStars(472937), "472.9k");
  assert.equal(formatStars(999999), "1.0M");
  assert.equal(formatStars(1200000), "1.2M");

  assert.equal(formatPerDay(2130.3), "+2130/天");
  assert.equal(formatPerDay(4.25), "+4.3/天");
});

test("日期只留年月日，补零", () => {
  assert.equal(formatShortDate(new Date(2026, 0, 5)), "26.01.05");
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

test("页面与脚本：/picks 存在、进了导航、同步脚本在", () => {
  assert.ok(has("app/picks/page.tsx"), "缺 /picks 页面");
  assert.ok(has("components/pick-list.tsx"), "缺列表组件");
  assert.ok(has("scripts/sync-ai-picks.mjs"), "缺同步脚本");
  assert.ok(read("components/site-header.tsx").includes('"/picks"'), "导航里没有精选");
  assert.ok(read("package.json").includes("sync:picks"), "package.json 没注册 sync:picks");
});
