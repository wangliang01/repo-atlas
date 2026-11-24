import { test } from "node:test";
import assert from "node:assert/strict";
import { QUOTAS, pickBucket, selectPicks, trendScore, type Candidate } from "./discovery.ts";

const TODAY = new Date(2026, 10, 24);

function candidate(overrides: Partial<Candidate> & { repo: string }): Candidate {
  return {
    stars: 1000,
    starsPerDay: 1,
    createdAt: new Date(2025, 0, 1),
    ...overrides,
  };
}

test("一个 3 天前创建、60 星的新仓库能进榜，不会被 20 万星老项目挤掉", () => {
  const picks = selectPicks(
    [
      candidate({ repo: "old/anchor", stars: 200_000, starsPerDay: 50 }),
      candidate({ repo: "new/fresh", stars: 60, starsPerDay: 20, createdAt: new Date(2026, 10, 21) }),
    ],
    TODAY,
  );
  assert.deepEqual(picks.map((pick) => pick.repo).sort(), ["new/fresh", "old/anchor"]);
  assert.equal(picks.find((pick) => pick.repo === "new/fresh")!.bucket, "fresh");
});

test("配额生效：锚点和 fresh 各有保底名额，剩余继续按趋势补满", () => {
  const anchors = Array.from({ length: 20 }, (_, index) =>
    candidate({ repo: `anchor/${index}`, stars: 20_000 - index, starsPerDay: 100 - index }),
  );
  const fresh = Array.from({ length: 20 }, (_, index) =>
    candidate({
      repo: `fresh/${index}`,
      stars: 500,
      starsPerDay: 10 + index,
      createdAt: new Date(2026, 10, 20),
    }),
  );
  const picks = selectPicks([...anchors, ...fresh], TODAY);
  assert.equal(picks.length, 30);
  assert.ok(picks.filter((pick) => pick.bucket === "anchor").length >= QUOTAS.anchor);
  assert.ok(picks.filter((pick) => pick.bucket === "fresh").length >= QUOTAS.fresh);
});

test("同一个仓库从多条 lane 进来只算一次，大小写不同也合并", () => {
  const picks = selectPicks(
    [
      candidate({ repo: "Foo/Bar", stars: 5000, starsPerDay: 3 }),
      candidate({ repo: "foo/bar", stars: 5200, starsPerDay: 3.2, starsDelta7d: 70 }),
    ],
    TODAY,
  );
  assert.equal(picks.length, 1);
  assert.equal(picks[0].stars, 5200);
  assert.equal(picks[0].starsDelta7d, 70);
  assert.equal(picks[0].key, "foo/bar");
});

test("trendScore 优先用 7 天增量；没有采样才回退到终身平均", () => {
  const withDelta = candidate({ repo: "a/with", starsPerDay: 1, starsDelta7d: 700 });
  const without = candidate({ repo: "b/without", starsPerDay: 1 });
  assert.equal(trendScore(withDelta), 100);
  assert.equal(trendScore(without), 1);
  const picks = selectPicks([without, withDelta], TODAY);
  assert.deepEqual(picks.map((pick) => pick.repo), ["a/with", "b/without"]);
});

test("人工提名的项目单独分桶，并优先保留", () => {
  const picks = selectPicks(
    [
      ...Array.from({ length: 30 }, (_, index) =>
        candidate({ repo: `hot/${index}`, stars: 10_000, starsPerDay: 500 + index }),
      ),
      candidate({ repo: "picked/one", stars: 30, starsPerDay: 1, approved: true }),
    ],
    TODAY,
  );
  assert.ok(picks.some((pick) => pick.repo === "picked/one"));
  assert.equal(picks.find((pick) => pick.repo === "picked/one")!.bucket, "nominated");
});

test("limit 很小时也至少保留一个新项目", () => {
  const picks = selectPicks(
    [
      candidate({ repo: "old/big", stars: 300_000, starsPerDay: 900 }),
      candidate({ repo: "new/small", stars: 20, starsPerDay: 5, createdAt: new Date(2026, 10, 23) }),
    ],
    TODAY,
    1,
  );
  assert.equal(picks.length, 1);
  assert.equal(picks[0].repo, "new/small");
});

test("候选少于 limit 时全部入选，顺序按 trendScore 稳定", () => {
  const picks = selectPicks(
    [candidate({ repo: "b/two", starsPerDay: 2 }), candidate({ repo: "a/one", starsPerDay: 9 })],
    TODAY,
  );
  assert.deepEqual(picks.map((pick) => pick.repo), ["a/one", "b/two"]);
});

test("pickBucket 的分类边界", () => {
  assert.equal(pickBucket(candidate({ repo: "x/n", approved: true }), TODAY), "nominated");
  assert.equal(
    pickBucket(candidate({ repo: "x/f", createdAt: new Date(2026, 10, 1) }), TODAY),
    "fresh",
  );
  assert.equal(pickBucket(candidate({ repo: "x/m", starsDelta7d: 1 }), TODAY), "momentum");
  assert.equal(pickBucket(candidate({ repo: "x/a", stars: 9000 }), TODAY), "anchor");
});
