import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRepoDetail, slugForRepo } from "./repo-detail.ts";

const FIXTURE = `---
repo: "owner/project"
title: "一个示例项目"
summary: "用一句话说清楚它是什么。"
categories: ["前端"]
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
