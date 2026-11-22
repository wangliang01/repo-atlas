import { test } from "node:test";
import assert from "node:assert/strict";
import { REPOS } from "./repos.ts";

test("仓库列表：8 条，字段齐全，没有空描述", () => {
  assert.equal(REPOS.length, 8, "不是 8 条");
  for (const repo of REPOS) {
    assert.ok(repo.name.length > 0, "有仓库缺名字");
    assert.ok(repo.desc.length > 0, `${repo.name} 没有描述`);
    assert.ok(repo.lang.length > 0, `${repo.name} 没有语言`);
    assert.match(repo.updated, /^\d{4}-\d{2}$/, `${repo.name} 的 updated 不是 YYYY-MM`);
  }
});

test("仓库链接都指向 wangliang01，且和名字对得上", () => {
  for (const repo of REPOS) {
    assert.equal(
      repo.url,
      `https://github.com/wangliang01/${repo.name}`,
      `${repo.name} 的链接不对`,
    );
  }
});

test("仓库不重复，且按最近推送倒序", () => {
  const names = REPOS.map((repo) => repo.name);
  assert.equal(new Set(names).size, names.length, "有重复仓库");

  const dates = REPOS.map((repo) => repo.updated);
  assert.deepEqual(dates, [...dates].sort((a, b) => (a < b ? 1 : -1)), "没有按时间倒序");
});
