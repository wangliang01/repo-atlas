import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { projectFrontmatter, noteFrontmatter, assertAlternativesExist } from "./schema.ts";
import { getAllProjects, getProject, getAllNotes, getLatestUpdate, getIssueNumber } from "./content.ts";

const validProject = {
  name: "Cal.com",
  repo: "calcom/cal.com",
  tagline: "开源自托管的日程调度",
  verdict: "recommend",
  topics: ["self-hosted", "scheduling"],
  replaces: ["Calendly"],
  deploy: "docker",
  setupTime: "30min",
  maintenance: "active",
  license: "AGPL-3.0",
  language: "TypeScript",
  stars: 32000,
  screenshot: "/shots/cal-com.webp",
  publishedAt: "2026-11-20",
  highlight: "用 tRPC 把前后端类型打通",
  forWho: "需要掌控数据的 5 人团队",
  notFor: "需要开箱即用 SaaS 的个人",
  alternatives: [],
};

test("合法 frontmatter 通过校验，且 publishedAt 按本地时区解析", () => {
  const parsed = projectFrontmatter.parse(validProject);
  assert.equal(parsed.verdict, "recommend");
  assert.equal(parsed.publishedAt.getFullYear(), 2026);
  assert.equal(parsed.publishedAt.getMonth(), 10, "月份应为 11 月（0 基）");
  assert.equal(parsed.publishedAt.getDate(), 20, "跨时区解析会差一天");
});

test("缺必填字段时点名该字段", () => {
  const { verdict, ...withoutVerdict } = validProject;
  void verdict;
  const r = projectFrontmatter.safeParse(withoutVerdict);
  assert.equal(r.success, false);
  assert.ok(
    r.error.issues.some((i) => i.path.includes("verdict")),
    `报错应指向 verdict，实际：${JSON.stringify(r.error.issues.map((i) => i.path))}`,
  );
});

test("枚举值写错时列出允许值", () => {
  const r = projectFrontmatter.safeParse({ ...validProject, verdict: "maybe" });
  assert.equal(r.success, false);
  const msg = r.error.issues.map((i) => i.message).join(" ");
  for (const allowed of ["recommend", "watch", "avoid"]) {
    assert.ok(msg.includes(allowed), `报错应列出允许值 ${allowed}，实际：${msg}`);
  }
});

test("tagline 超过 24 字被拒绝", () => {
  const r = projectFrontmatter.safeParse({ ...validProject, tagline: "一".repeat(25) });
  assert.equal(r.success, false);
});

test("alternatives 指向不存在的 slug 时抛错", () => {
  assert.throws(
    () =>
      assertAlternativesExist([
        { slug: "cal-com", data: { alternatives: ["not-exist"] } },
      ] as never),
    /not-exist/,
  );
});

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

test("真实内容可读：数量与文件数一致，且能按 slug 取到", () => {
  const fileCount = readdirSync(new URL("../content/projects", import.meta.url)).filter((f) =>
    f.endsWith(".mdx"),
  ).length;
  const all = getAllProjects();
  assert.equal(all.length, fileCount, "读到的条目数应与 mdx 文件数一致");
  const one = getProject("cal-com");
  assert.equal(one?.data.name, "Cal.com");
  assert.equal(getAllNotes().length, 1);
  assert.ok(getLatestUpdate() instanceof Date);
  assert.equal(getIssueNumber(), Math.max(1, Math.ceil(fileCount / 3)));
});
