import { test } from "node:test";
import assert from "node:assert/strict";
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

test("仓库里的 PROFILE 是空的——证明没编造姓名和联系方式", () => {
  assert.equal(hasPersonalProfile(PROFILE), false, "PROFILE 里有值，说明有人填了假数据");
});
