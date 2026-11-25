import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { parseRepoDetail, slugForRepo } from "./repo-detail.ts";
import { REPO_DETAIL_SECTIONS } from "./schema.ts";

const FIXTURE = `---
repo: "owner/project"
title: "一个示例项目"
summary: "用一句话说清楚它是什么。"
domains: ["编码与开发"]
forms: ["SDK 与库"]
identities: ["后端"]
peers: ["Orca"]
verdict: watch
featuredAt: 2026-11-24
readmeSha: "0123456789abcdef0123456789abcdef01234567"
readmeFetchedAt: 2026-11-24
sources: [github]
---

## 它是什么

示例。

## 它替掉了什么麻烦

示例。

## 跑起来要几步

示例。

## 它把复杂度放在哪

示例。

## 什么时候别用它

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
  assert.deepEqual(detail.data.forms, ["SDK 与库"]);
  assert.deepEqual(detail.data.identities, ["后端"]);
  assert.deepEqual(detail.data.peers, ["Orca"]);
  assert.equal(detail.data.verdict, "watch");
  assert.equal(detail.data.featuredAt.getFullYear(), 2026);
  assert.match(detail.body, /## 它是什么/);
});

test("文件名 slug 与 repo 不一致时抛错", () => {
  assert.throws(() => parseRepoDetail("wrong--slug", FIXTURE), /slug 应为 owner--project/);
});

test("缺少正文小节时抛错，并指出缺哪几节", () => {
  const body = FIXTURE.replace("## 什么时候别用它\n\n示例。\n", "");
  assert.throws(() => parseRepoDetail("owner--project", body), /缺少小节 什么时候别用它/);
});

test("详情页目录过滤掉「来源」", () => {
  const page = readFileSync(new URL("../app/picks/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(page, /heading\.text !== "来源"/);
});

test("缺必填字段时抛错", () => {
  const body = FIXTURE.replace("verdict: watch\n", "");
  assert.throws(() => parseRepoDetail("owner--project", body), /verdict/);
});

test("summary 为空时抛错", () => {
  const body = FIXTURE.replace('summary: "用一句话说清楚它是什么。"', 'summary: ""');
  assert.throws(() => parseRepoDetail("owner--project", body), /summary/);
});

test("详情页正文有足够深度，并区分 README 与编辑判断", () => {
  const dir = new URL("../content/repos/", import.meta.url);
  const files = readdirSync(dir).filter((file) => file.endsWith(".mdx"));
  for (const file of files) {
    const src = readFileSync(new URL(file, dir), "utf8");
    const raw = src.split("---")[2].split("## 来源")[0].replace(/```[\s\S]*?```/g, "");
    const cjk = (raw.match(/[一-鿿]/g) ?? []).length;
    const h2 = [...src.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim());
    assert.deepEqual(h2, [...REPO_DETAIL_SECTIONS], `${file} 的二级标题不是六节标准结构`);
    assert.ok(cjk >= 1500, `${file} 正文只有 ${cjk} 个汉字，少于 1500`);
    assert.match(src, /README/, `${file} 没有说明内容依据 README`);
    assert.match(src, /编辑判断|README 未说明/, `${file} 没有区分编辑判断或未说明项`);
  }
});
