import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  extractHeadings,
  findFences,
  parseNoteSections,
  readingTimeOf,
  slugify,
} from "./mdx.ts";
import { preprocessCode } from "./highlight.ts";
import { getAllNotes } from "./content.ts";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("slugify：中文保留，空格变连字符，标点去掉", () => {
  assert.equal(slugify("我还没搞懂的部分"), "我还没搞懂的部分");
  assert.equal(slugify("选了 MDX 之后多出来的东西"), "选了-mdx-之后多出来的东西");
  assert.equal(slugify("校验必须自己写。"), "校验必须自己写");
  assert.equal(slugify("  Why MDX?  "), "why-mdx");
});

test("extractHeadings：只收 h2/h3，跳过代码块里的井号", () => {
  const body = [
    "## 起点",
    "",
    "### 一个小标题",
    "",
    "```bash",
    "## 这不是标题",
    "```",
    "",
    "#### 四级不算",
    "",
    "## 我还没搞懂的部分",
  ].join("\n");

  const headings = extractHeadings(body);
  assert.deepEqual(
    headings.map((h) => [h.depth, h.text]),
    [
      [2, "起点"],
      [3, "一个小标题"],
      [2, "我还没搞懂的部分"],
    ],
  );
  assert.equal(headings[1].id, "一个小标题");
});

test("parseNoteSections：正文与「我还没搞懂的部分」被切开，缺这一段就报错", () => {
  const body = "## 起点\n\n正文。\n\n## 我还没搞懂的部分\n\n高亮会不会拖慢构建。\n";
  const sections = parseNoteSections(body);
  assert.ok(!sections.main.includes("我还没搞懂的部分"), "正文里不该再留这一节");
  assert.ok(sections.unresolved.includes("高亮会不会拖慢构建"));

  assert.throws(
    () => parseNoteSections("## 起点\n\n只有正文。\n"),
    /我还没搞懂的部分/,
    "缺诚实小节必须让构建失败",
  );
});

test("findFences：解析语言、文件名、行号开关", () => {
  const body = [
    "前文",
    "",
    '```ts filename="lib/schema.ts" lines',
    "const a = 1;",
    "```",
    "",
    "```bash",
    "pnpm build",
    "```",
  ].join("\n");

  const fences = findFences(body);
  assert.equal(fences.length, 2);
  assert.equal(fences[0].lang, "ts");
  assert.equal(fences[0].filename, "lib/schema.ts");
  assert.equal(fences[0].lineNumbers, true);
  assert.equal(fences[0].code, "const a = 1;\n");
  assert.equal(fences[1].lang, "bash");
  assert.equal(fences[1].filename, undefined);
  assert.equal(fences[1].lineNumbers, false);
});

test("findFences：CRLF 文件也能认出围栏和文件名", () => {
  const body = '```ts filename="lib/schema.ts"\r\nconst a = 1;\r\n```\r\n';
  const fences = findFences(body);
  assert.equal(fences.length, 1);
  assert.equal(fences[0].filename, "lib/schema.ts");
  assert.equal(fences[0].code, "const a = 1;\n");
});

test("preprocessCode：围栏变成 CodeBlock，HTML 带 data-language 且无残留反引号", async () => {
  const body = '```ts filename="a.ts"\nconst a = 1;\n```\n';
  const out = await preprocessCode(body);

  assert.ok(!out.includes("```"), "围栏应该被替换掉");
  assert.match(out, /<CodeBlock/);
  assert.match(out, /filename="a\.ts"/);

  const html = Buffer.from(/html="([^"]+)"/.exec(out)![1], "base64").toString("utf8");
  assert.match(html, /<pre/);
  assert.match(html, /data-language="ts"/);

  const code = Buffer.from(/code="([^"]+)"/.exec(out)![1], "base64").toString("utf8");
  assert.equal(code, "const a = 1;\n");
});

test("readingTimeOf：中文按字数、英文按词数估，至少 1 分钟", () => {
  assert.equal(readingTimeOf("短"), 1);
  const long = "中".repeat(700);
  assert.equal(readingTimeOf(long), 2);
});

test("阅读时长由正文算出，内容里不许再手填", () => {
  for (const note of getAllNotes()) {
    assert.ok(
      !/^readingTime:/m.test(read(`content/notes/${note.slug}.mdx`)),
      `${note.slug} 又手填了 readingTime，会和正文长度对不上`,
    );
    const minutes = readingTimeOf(note.body);
    assert.ok(minutes >= 1 && minutes <= 60, `${note.slug} 算出来的阅读时长不合理：${minutes}`);
  }
});

test("笔记页：列表与详情都存在，且都是静态预渲染", () => {
  assert.ok(has("app/notes/page.tsx"), "缺 /notes 列表页");
  assert.ok(has("app/notes/[slug]/page.tsx"), "缺笔记详情页");
  const detail = read("app/notes/[slug]/page.tsx");
  assert.ok(detail.includes("generateStaticParams"));
  assert.ok(detail.includes("generateMetadata"));
  assert.ok(detail.includes("dynamicParams = false"), "未知 slug 必须 404 而不是运行时渲染");
});

test("笔记内容：至少一个带文件名的代码块，且有小标题供目录使用", () => {
  const body = read("content/notes/why-mdx.mdx");
  const fences = findFences(body);
  assert.ok(fences.some((f) => f.filename), "示例笔记里没有带文件名的代码块，复制按钮无从验证");
  assert.ok(extractHeadings(body).some((h) => h.depth === 3), "没有 h3，目录层级无法验证");
});

test("没有运行时高亮库：只有 shiki，没有 prism / highlight.js", () => {
  const pkg = read("package.json");
  assert.match(pkg, /"shiki"/);
  assert.ok(!/prism|highlight\.js/.test(pkg), "不允许引入运行时高亮库");
});
