import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { parseRepoDetail, slugForRepo } from "./repo-detail.ts";

const FIXTURE = `---
repo: "owner/project"
title: "一个示例项目"
summary: "用一句话说清楚它是什么。"
domains: ["编码与开发"]
forms: ["框架 / SDK / 库"]
peers: ["Orca"]
verdict: watch
featuredAt: 2026-11-24
readmeSha: "0123456789abcdef0123456789abcdef01234567"
readmeFetchedAt: 2026-11-24
sources: [github]
---

## 它是什么

示例。

## 怎么上手

示例。

## 值得注意的设计

示例。

## 边界与风险

示例。

## 来源

示例。
`;

test("slugForRepo：小写并把 / 换成 --", () => {
  assert.equal(slugForRepo("Vercel-Labs/UI"), "vercel-labs--ui");
  assert.equal(slugForRepo("sybil-solutions/inference-optimisation-skill"), "sybil-solutions--inference-optimisation-skill");
});

test("合法详情页：解析成功，日期是本地 Date", () => {
  const detail = parseRepoDetail("owner--project", FIXTURE);
  assert.equal(detail.data.repo, "owner/project");
  assert.deepEqual(detail.data.domains, ["编码与开发"]);
  assert.deepEqual(detail.data.forms, ["框架 / SDK / 库"]);
  assert.deepEqual(detail.data.peers, ["Orca"]);
  assert.equal(detail.data.verdict, "watch");
  assert.equal(detail.data.featuredAt.getFullYear(), 2026);
  assert.match(detail.body, /## 它是什么/);
});

test("文件名 slug 与 repo 不一致时抛错", () => {
  assert.throws(() => parseRepoDetail("wrong--slug", FIXTURE), /slug 应为 owner--project/);
});

test("缺少正文小节时抛错，并指出缺哪几节", () => {
  const body = FIXTURE.replace("## 边界与风险\n\n示例。\n", "");
  assert.throws(() => parseRepoDetail("owner--project", body), /缺少小节 边界与风险/);
});

test("缺必填字段时抛错", () => {
  const body = FIXTURE.replace("verdict: watch\n", "");
  assert.throws(() => parseRepoDetail("owner--project", body), /verdict/);
});

test("summary 为空时抛错", () => {
  const body = FIXTURE.replace('summary: "用一句话说清楚它是什么。"', 'summary: ""');
  assert.throws(() => parseRepoDetail("owner--project", body), /summary/);
});

test("新收录页有足够正文：至少 1000 字，并区分 README 与编辑判断", () => {
  const dir = new URL("../content/repos/", import.meta.url);
  const files = readdirSync(dir).filter((file) => file.endsWith(".mdx"));
  for (const file of files) {
    const src = readFileSync(new URL(file, dir), "utf8");
    if (!src.includes("sources: [github, toutiao]")) continue;
    const body = src
      .split("---")[2]
      .split("## 来源")[0]
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\s/g, "");
    assert.ok(body.length >= 1000, `${file} 正文只有 ${body.length} 字，太短`);
    assert.match(src, /README/, `${file} 没有说明内容依据 README`);
    assert.match(src, /编辑判断|README 未说明/, `${file} 没有区分编辑判断或未说明项`);
  }
});
