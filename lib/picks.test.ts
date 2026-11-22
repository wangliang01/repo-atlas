import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { parseHelloGitHub } from "./hellogithub.ts";
import { getAllPicks, getPickCategories } from "./content.ts";
import { pickEntry } from "./schema.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

const FIXTURE = [
  "# 《HelloGitHub》第 99 期",
  "> 兴趣是最好的老师",
  "",
  "## 目录",
  "",
  "### C 项目",
  "",
  "1、[不该出现的](https://github.com/x/y)：目录里的不算。",
  "",
  "## 内容",
  "",
  "### Go 项目",
  "",
  "1、[gdu](https://hellogithub.com/periodical/statistics/click?target=https://github.com/dundee/gdu)：磁盘占用分析器。后面还有正文。",
  "",
  "<p align=\"center\"><img src='x'></p>",
  "",
  "### 其它",
  "",
  "2、[一个网站](https://hellogithub.com/periodical/statistics/click?target=https://example.com/)：不是 GitHub 仓库。",
  "",
  "3、[buildg](https://hellogithub.com/periodical/statistics/click?target=https://github.com/debugbuild/buildg)：给 Delve 套了个界面。",
  "",
  "## 赞助",
  "",
  "4、[赞助商](https://hellogithub.com/periodical/statistics/click?target=https://github.com/a/b)：赞助之后的不算。",
].join("\n");

test("导入解析：只收「内容」段里的 GitHub 仓库，目录与赞助段不算", () => {
  const { entries, skipped } = parseHelloGitHub(FIXTURE);

  assert.deepEqual(
    entries.map((entry) => [entry.name, entry.repo, entry.category, entry.tagline]),
    [
      ["gdu", "dundee/gdu", "Go 项目", "磁盘占用分析器"],
      ["buildg", "debugbuild/buildg", "其它", "给 Delve 套了个界面"],
    ],
  );
  assert.equal(skipped, 1, "非 GitHub 仓库要单独计数，不能悄悄丢掉");
});

test("精选条目：why 为空就不许通过，照抄简介不算收录", () => {
  const base = {
    name: "x",
    repo: "a/b",
    category: "Go 项目",
    tagline: "一句话",
  };

  const withoutWhy = pickEntry.safeParse({ ...base, why: "" });
  assert.equal(withoutWhy.success, false);
  assert.match(
    withoutWhy.success ? "" : withoutWhy.error.issues[0].message,
    /why/,
    "报错要指出是 why 的问题",
  );

  assert.equal(pickEntry.safeParse({ ...base, why: "我跑过，值得" }).success, true);
});

test("真实精选：至少一期，每条都有判断和非空 repo", () => {
  const picks = getAllPicks();
  assert.ok(picks.length >= 1, "content/picks 里没有内容");

  for (const issue of picks) {
    assert.ok(issue.entries.length >= 1, `第 ${issue.issue} 期没有条目`);
    for (const entry of issue.entries) {
      assert.match(entry.repo, /^[\w.-]+\/[\w.-]+$/, `${entry.name} 的 repo 写法不对`);
      assert.ok(entry.why.trim().length > 0, `${entry.name} 没有写判断`);
    }
  }
});

test("分类列表：去重，按条目数从多到少", () => {
  const picks = getAllPicks();
  const categories = getPickCategories(picks);
  assert.equal(new Set(categories).size, categories.length, "分类有重复");

  const counts = categories.map(
    (category) =>
      picks.flatMap((issue) => issue.entries).filter((entry) => entry.category === category).length,
  );
  const sorted = [...counts].sort((a, b) => b - a);
  assert.deepEqual(counts, sorted, "分类没有按条目数排序");
});

test("页面与导航：/picks 存在且进了导航，导入脚本在", () => {
  assert.ok(has("app/picks/page.tsx"), "缺 /picks 页面");
  assert.ok(has("components/pick-list.tsx"), "缺卡片列表组件");
  assert.ok(has("scripts/import-hellogithub.mjs"), "缺导入脚本");
  assert.ok(read("components/site-header.tsx").includes('"/picks"'), "导航里没有精选");
});
