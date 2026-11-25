import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import matter from "gray-matter";
import { FORMS, IDENTITIES } from "./categories.ts";
import { repoDetailFrontmatter } from "./schema.ts";

const dir = new URL("../content/repos/", import.meta.url);
const files = readdirSync(dir).filter((file) => file.endsWith(".mdx"));

function pages() {
  return files.map((file) => ({
    file,
    data: repoDetailFrontmatter.parse(matter(readFileSync(new URL(file, dir), "utf8")).data),
  }));
}

test("形态表：一个标签只说一件事，不带斜杠", () => {
  for (const form of FORMS) {
    assert.equal(form.includes("/"), false, `形态「${form}」还在用斜杠复合`);
    assert.ok(form.trim().length > 0, "形态不能是空字符串");
  }
  assert.equal(new Set(FORMS).size, FORMS.length, "形态表有重复项");
});

test("身份表：只写人群，不写任务，不带斜杠", () => {
  for (const identity of IDENTITIES) {
    assert.equal(identity.includes("/"), false, `身份「${identity}」带斜杠`);
  }
  assert.equal(new Set(IDENTITIES).size, IDENTITIES.length, "身份表有重复项");
});

test("全站 frontmatter 只用新表：没有旧复合标签，也没有兜底领域", () => {
  for (const { file, data } of pages()) {
    for (const form of data.forms) {
      assert.ok((FORMS as readonly string[]).includes(form), `${file} 的形态「${form}」不在新表里`);
    }
    for (const identity of data.identities) {
      assert.ok((IDENTITIES as readonly string[]).includes(identity), `${file} 的身份「${identity}」不在表里`);
    }
    assert.equal(
      (data.domains as readonly string[]).includes("通用与跨领域"),
      false,
      `${file} 还在用兜底领域「通用与跨领域」`,
    );
  }
});

test("兜底值不许回潮：其他 ≤ 2 篇，身份留空 ≤ 5 篇", () => {
  const all = pages();
  const others = all.filter(({ data }) => data.domains.includes("其他"));
  const noIdentity = all.filter(({ data }) => data.identities.length === 0);
  assert.ok(others.length <= 2, `「其他」有 ${others.length} 篇，兜底类回潮`);
  assert.ok(noIdentity.length <= 5, `有 ${noIdentity.length} 篇没填身份，身份层形同虚设`);
});

test("身份不写「它用了什么」：AI 身份只给做模型或 Agent 的项目", () => {
  // 用了模型的剪辑、写作工具，身份应落在自媒体 / 前端，而不是 AI
  const byFile = new Map(pages().map((page) => [page.file, page.data.identities]));
  for (const file of ["iamajmeena--neonclipping.mdx", "heydamir--unslop.mdx"]) {
    const identities = byFile.get(file) ?? [];
    assert.equal(identities.includes("AI"), false, `${file} 把「用了 AI」写成了身份 AI`);
  }
});
