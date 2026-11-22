import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("列表行：标题 16px 600 + 两行描述 + 一行 meta，三种行共用一套字号", () => {
  for (const file of ["components/pick-row.tsx", "components/repo-row.tsx", "components/note-card.tsx"]) {
    assert.ok(has(file), `${file} 不存在`);
    const row = read(file);
    assert.ok(row.includes("text-body font-semibold"), `${file} 标题不是 16px 600`);
    assert.ok(row.includes("text-small"), `${file} 描述没用 13px 档`);
    assert.ok(row.includes("text-micro"), `${file} 元信息没用 12px 档`);
    assert.equal(row.includes("font-serif"), false, `${file} 还在用衬线`);
    assert.equal(row.includes("border border-line"), false, `${file} 还是旧的外框卡片写法`);
  }
});

test("区块标题组件：标题 + 可选的右侧动作", () => {
  assert.ok(has("components/section-head.tsx"), "components/section-head.tsx 不存在");
  const head = read("components/section-head.tsx");
  assert.ok(head.includes("h2"), "没有二级标题");
  assert.ok(head.includes("action"), "没有右侧动作入口");
});

test("首页组装：身份卡 + 轨迹 + 笔记，第一屏不是 feed", () => {
  const page = read("app/page.tsx");
  for (const part of ["IdentityCard", "RepoRow", "RisingPanel"]) {
    assert.ok(page.includes(part), `首页缺 ${part}`);
  }
  assert.equal(page.includes("本期"), false, "首页还在用「本期」这个说法");
});

test("正文插图：img 有懒加载和宽度约束，图注组件已注册", () => {
  const prose = read("components/prose.tsx");
  assert.ok(prose.includes('loading="lazy"'), "img 没有懒加载，长文会一次性拉全部图");
  assert.ok(prose.includes("w-full"), "img 没有宽度约束，2 倍图会撑破 720px 正文");

  assert.ok(has("components/figure.tsx"), "components/figure.tsx 不存在");
  const figure = read("components/figure.tsx");
  assert.ok(figure.includes("figcaption"), "图注组件没有 figcaption");
  assert.ok(figure.includes("caption"), "图注组件没有 caption 入参");

  // MDX 里的 <Figure> 靠 components 映射解析，漏了会渲染成未知标签
  const page = read("app/notes/[slug]/page.tsx");
  assert.ok(page.includes("Figure"), "笔记页没注册 Figure");
});
