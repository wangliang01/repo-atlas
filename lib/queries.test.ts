import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQueries, isWithinDays, isoDaysBefore, searchUrl } from "./queries.ts";

const TODAY = new Date(2026, 10, 24);

test("查询矩阵有 9 条 lane，id 和 query 都不重复", () => {
  const queries = buildQueries(TODAY);
  assert.equal(queries.length, 9);
  assert.equal(new Set(queries.map((query) => query.id)).size, 9);
  assert.equal(new Set(queries.map((query) => query.q)).size, 9);
});

test("时间窗口按当天往前推，不是写死的日期", () => {
  const byId = new Map(buildQueries(TODAY).map((query) => [query.id, query]));
  assert.match(byId.get("fresh-7d")!.q, /created:>2026-11-17/);
  assert.match(byId.get("fresh-30d")!.q, /created:>2026-10-25/);
  assert.match(byId.get("mcp")!.q, /created:>2026-09-25/);
  assert.match(byId.get("rag")!.q, /created:>2026-08-26/);
  assert.equal(byId.get("anchor")!.windowDays, 0);
  assert.doesNotMatch(byId.get("anchor")!.q, /created:/);
});

test("不再只有 topic:ai：Agent / MCP / LLM / Claude Code / RAG 都覆盖", () => {
  const all = buildQueries(TODAY).map((query) => query.q).join(" | ");
  for (const token of ["topic:agent", "mcp in:name,description", "llm in:name,description", "topic:claude-code", "topic:rag"]) {
    assert.ok(all.includes(token), `缺少 ${token}`);
  }
});

test("GitHub 搜索的 query 长度远低于 256 字符上限", () => {
  for (const query of buildQueries(TODAY)) {
    assert.ok(query.q.length < 256, `${query.id} 长 ${query.q.length}`);
  }
});

test("searchUrl 带排序与分页参数", () => {
  const [anchor] = buildQueries(TODAY);
  const url = new URL(searchUrl(anchor, 30));
  assert.equal(url.hostname, "api.github.com");
  assert.equal(url.searchParams.get("sort"), "stars");
  assert.equal(url.searchParams.get("per_page"), "30");
  assert.equal(url.searchParams.get("q"), anchor.q);
});

test("isoDaysBefore 跨月与跨年都按本地日期算", () => {
  assert.equal(isoDaysBefore(new Date(2026, 0, 2), 7), "2025-12-26");
  assert.equal(isoDaysBefore(new Date(2026, 10, 24), 30), "2026-10-25");
});

test("isWithinDays 严格小于窗口：第 30 天算过期，第 29 天算新", () => {
  assert.equal(isWithinDays(new Date(2026, 10, 1), TODAY, 30), true);
  assert.equal(isWithinDays(new Date(2026, 9, 25), TODAY, 30), false);
  assert.equal(isWithinDays(new Date(2026, 9, 26), TODAY, 30), true);
});
