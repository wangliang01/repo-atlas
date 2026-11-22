import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CONTAINER, MD, PADDING, XL, feedWidth } from "./layout.ts";

const shell = readFileSync(new URL("../components/site-shell.tsx", import.meta.url), "utf8");

test("栅格：className 里的字面量和 lib/layout.ts 的数字一致", () => {
  assert.ok(
    shell.includes(`md:grid-cols-[${MD.left}px_minmax(0,1fr)]`),
    `md 模板和 MD.left=${MD.left} 对不上`,
  );
  assert.ok(
    shell.includes(`xl:grid-cols-[${XL.left}px_minmax(0,1fr)_${XL.right}px]`),
    `xl 模板和 XL=${XL.left}/${XL.right} 对不上`,
  );
  // gap-5 = 20px，跟掘金的列间距一致
  assert.equal(MD.gap, 20);
  assert.equal(XL.gap, 20);
  assert.ok(shell.includes("md:gap-5"), "md 间距类和常量对不上");
});

test("feed 宽度：xl 672、md 776/520、sm 335", () => {
  assert.equal(feedWidth(1440, "xl"), 672);
  assert.equal(feedWidth(1280, "xl"), 672);
  assert.equal(feedWidth(1024, "md"), 776);
  assert.equal(feedWidth(768, "md"), 520);
  assert.equal(feedWidth(375, "sm"), 335);
});

test("三栏之和等于容器内容宽，不多不少", () => {
  const content = CONTAINER - PADDING * 2;
  assert.equal(XL.left + XL.right + XL.gap * 2 + feedWidth(1280, "xl"), content);
});

test("两栏档 feed 不低于 520：再窄精选行就会溢出", () => {
  for (const viewport of [768, 900, 1024, 1279]) {
    assert.ok(feedWidth(viewport, "md") >= 520, `${viewport}px 下 feed 只有 ${feedWidth(viewport, "md")}px`);
  }
});

test("sticky 的 aside 不能 self-start，否则收缩后没有行程，滚动时跟着走", () => {
  assert.ok(shell.includes("md:sticky") || shell.includes("sticky"), "aside 没有 sticky");
  assert.ok(shell.includes("top-[76px]"), "sticky 偏移不是 header 60 + 16");
  // 实测过：加 self-start 后 railTop 滚到 -351，sticky 完全失效。
  // 只查开标签，注释里写这个词是为了解释为什么不能用它。
  const tags = shell.match(/<aside[^>]*>/g) ?? [];
  assert.ok(tags.length >= 2, `aside 数量不对：${tags.length}`);
  for (const tag of tags) {
    assert.equal(tag.includes("self-start"), false, `aside 上有 self-start：${tag}`);
  }
});

test("左栏和 feed 是白卡片面板，右栏在 xl 以下隐藏", () => {
  assert.ok(shell.includes("panel"), "没有用 .panel 白卡片");
  assert.ok(shell.includes("hidden") && shell.includes("xl:block"), "右栏没有 xl 以下隐藏");
  assert.ok(shell.includes("ShellStrip") && shell.includes("xl:hidden"), "缺 ShellStrip 降级");
});

test("feed 面板不能 overflow-hidden：它会变成 sticky 的包含块", () => {
  // 实测过：加了 overflow-hidden 后，精选顶部 top-[60px] 的筛选行按面板顶算，
  // 被推下去 60px 盖住第一行（barTop 248 vs firstLi 234）。
  const tag = shell.match(/<div data-shell-feed[^>]*>/)?.[0] ?? "";
  assert.ok(tag.length > 0, "找不到 feed 面板的开标签");
  assert.equal(tag.includes("overflow-hidden"), false, "feed 面板又加了 overflow-hidden");
});
