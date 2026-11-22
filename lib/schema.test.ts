import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { noteFrontmatter } from "./schema.ts";
import { getAllNotes, getLatestUpdate } from "./content.ts";

test("笔记 frontmatter 不含阅读时长：它由正文算，不靠手填", () => {
  const ok = noteFrontmatter.safeParse({
    title: "为什么用 MDX 而不是 CMS",
    summary: "内容少、更新慢，Git 就是最好的后台。",
    kind: "tool",
    publishedAt: "2026-11-18",
  });
  assert.equal(ok.success, true);
  const bad = noteFrontmatter.safeParse({ title: "x", summary: "y", kind: "随笔", publishedAt: "2026-11-18" });
  assert.equal(bad.success, false);
});

test("日期按本地时区解析，跨时区不差一天", () => {
  const parsed = noteFrontmatter.parse({
    title: "t",
    summary: "s",
    kind: "source",
    publishedAt: "2026-11-20",
  });
  assert.equal(parsed.publishedAt.getFullYear(), 2026);
  assert.equal(parsed.publishedAt.getMonth(), 10, "月份应为 11 月（0 基）");
  assert.equal(parsed.publishedAt.getDate(), 20, "跨时区解析会差一天");
});

test("真实内容可读：数量与文件数一致", () => {
  const fileCount = readdirSync(new URL("../content/notes", import.meta.url)).filter((f) =>
    f.endsWith(".mdx"),
  ).length;
  assert.equal(getAllNotes().length, fileCount, "读到的条目数应与 mdx 文件数一致");
  assert.ok(getLatestUpdate() instanceof Date);
});
