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
  // gap-8 = 32px，gap-10 = 40px
  assert.equal(MD.gap, 32);
  assert.equal(XL.gap, 40);
  assert.ok(shell.includes("md:gap-8") && shell.includes("xl:gap-10"), "间距类和常量对不上");
});

test("feed 宽度：xl 592、md 784/528、sm 335", () => {
  assert.equal(feedWidth(1440, "xl"), 592);
  assert.equal(feedWidth(1280, "xl"), 592);
  assert.equal(feedWidth(1024, "md"), 784);
  assert.equal(feedWidth(768, "md"), 528);
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
  assert.ok(shell.includes("top-[72px]"), "sticky 偏移不是 header 56 + 16");
  // 实测过：加 self-start 后 railTop 滚到 -351，sticky 完全失效。
  // 只查开标签，注释里写这个词是为了解释为什么不能用它。
  const tags = shell.match(/<aside[^>]*>/g) ?? [];
  assert.ok(tags.length >= 2, `aside 数量不对：${tags.length}`);
  for (const tag of tags) {
    assert.equal(tag.includes("self-start"), false, `aside 上有 self-start：${tag}`);
  }
});

test("右栏在 xl 以下隐藏，个人信息改在 feed 末尾出现", () => {
  assert.ok(shell.includes("hidden") && shell.includes("xl:block"), "右栏没有 xl 以下隐藏");
  assert.ok(shell.includes("ShellStrip") && shell.includes("xl:hidden"), "缺 ShellStrip 降级");
});
