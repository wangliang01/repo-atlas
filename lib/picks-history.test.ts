import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyHistory, freshRepos, mergeHistory } from "./picks-history.ts";

test("第一次跑：全部算新增，firstSeen 都是今天", () => {
  const { history, firstSeen, added } = mergeHistory(emptyHistory(), ["a/one", "b/two"], "2026-11-22");
  assert.deepEqual(added.sort(), ["a/one", "b/two"]);
  assert.deepEqual(firstSeen, { "a/one": "2026-11-22", "b/two": "2026-11-22" });
  assert.deepEqual(history.seen, { "a/one": "2026-11-22", "b/two": "2026-11-22" });
  assert.equal(history.version, 1);
});

test("第二次跑：老条目沿用原日期，只有新面孔记今天", () => {
  const first = mergeHistory(emptyHistory(), ["a/one"], "2026-11-20");
  const second = mergeHistory(first.history, ["a/one", "c/three"], "2026-11-22");
  assert.deepEqual(second.firstSeen, { "a/one": "2026-11-20", "c/three": "2026-11-22" });
  assert.deepEqual(second.added, ["c/three"]);
});

test("同一天跑四次：第二次之后不再算新增", () => {
  const once = mergeHistory(emptyHistory(), ["a/one"], "2026-11-22");
  const twice = mergeHistory(once.history, ["a/one"], "2026-11-22");
  assert.deepEqual(twice.added, [], "同一天重复同步不该再打新上榜");
  assert.deepEqual([...freshRepos(twice.firstSeen, "2026-11-22")], ["a/one"]);
  assert.equal(freshRepos(twice.firstSeen, "2026-11-23").size, 0, "第二天就不算新了");
});

test("落榜超过 120 天忘掉，没超的留着等它回来", () => {
  const history = {
    version: 1 as const,
    seen: { "old/gone": "2026-01-01", "recent/gone": "2026-10-01", "still/here": "2026-01-01" },
  };
  const { history: next } = mergeHistory(history, ["still/here"], "2026-11-22");
  assert.equal(next.seen["old/gone"], undefined, "半年前的该剪掉");
  assert.equal(next.seen["recent/gone"], "2026-10-01", "上个月落榜的还留着");
  assert.equal(next.seen["still/here"], "2026-01-01", "还在榜上的永远保留");
});

test("台账键排序稳定：同样的输入写两次，字节一样", () => {
  const a = mergeHistory(emptyHistory(), ["z/z", "a/a", "m/m"], "2026-11-22").history;
  const b = mergeHistory(emptyHistory(), ["m/m", "a/a", "z/z"], "2026-11-22").history;
  assert.deepEqual(Object.keys(a.seen), ["a/a", "m/m", "z/z"]);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});
