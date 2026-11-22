import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PROFILE, hasPersonalProfile, visibleProfileFields } from "./profile.ts";

test("空 profile：字段全空，个人段判空", () => {
  const view = visibleProfileFields({});
  assert.equal(view.name, undefined);
  assert.equal(view.headline, undefined);
  assert.deepEqual(view.stack, []);
  assert.deepEqual(view.links, []);
  assert.equal(hasPersonalProfile({}), false);
});

test("只有 name 时只有 name，别的不会凭空出现", () => {
  const view = visibleProfileFields({ name: "张三" });
  assert.equal(view.name, "张三");
  assert.equal(view.headline, undefined);
  assert.deepEqual(view.stack, []);
  assert.deepEqual(view.links, []);
  assert.equal(hasPersonalProfile({ name: "张三" }), true);
});

test("空白串、空数组都丢掉，不算填了", () => {
  const view = visibleProfileFields({ name: "   ", stack: [" ", ""], location: " " });
  assert.equal(view.name, undefined);
  assert.equal(view.location, undefined);
  assert.deepEqual(view.stack, []);
  assert.equal(hasPersonalProfile({ name: "   ", stack: [" "] }), false);
});

test("只认 https 和 mailto，javascript: 与相对路径丢掉", () => {
  const view = visibleProfileFields({
    links: [
      { label: "坏", href: "javascript:alert(1)" },
      { label: "相对", href: "/resume" },
      { label: "GitHub", href: "https://github.com/someone" },
      { label: "邮箱", href: "mailto:someone@example.com" },
    ],
  });
  assert.deepEqual(
    view.links.map((link) => link.label),
    ["GitHub", "邮箱"],
  );
});

test("PROFILE 里只有用户自己给的事实：王亮 / 成都 / GitHub，没有邮箱", () => {
  const view = visibleProfileFields(PROFILE);
  assert.equal(view.name, "王亮");
  assert.equal(view.location, "成都");
  assert.ok(view.stack.length >= 4, "技术栈太少");
  assert.deepEqual(
    view.links.map((link) => link.href),
    ["https://github.com/wangliang01"],
    "链接不止 GitHub 一个，或者地址不对",
  );
  // 个人站公开 mailto 会被爬，用户明确说不显示邮箱
  assert.equal(view.links.some((link) => link.href.startsWith("mailto:")), false);
  assert.ok(view.avatar, "没头像");
  assert.ok(existsSync(new URL(`../public${view.avatar}`, import.meta.url)), `头像 ${view.avatar} 不存在`);
});

test("定位句写「在做什么」，不写「还差什么」", () => {
  const headline = visibleProfileFields(PROFILE).headline ?? "";
  // 「在补 X」是缺口式表达，招聘的人扫一眼读到的是「不会」
  for (const bad of ["在补", "还在学", "正在学", "入门", "小白"]) {
    assert.equal(headline.includes(bad), false, `定位句不该出现「${bad}」：${headline}`);
  }
  assert.ok(headline.length > 0 && headline.length <= 20, `定位句长度不合适：${headline}`);
});
