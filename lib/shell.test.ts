import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");
const has = (p: string) => existsSync(new URL(p, root));

test("首屏主题脚本：读 localStorage、跟随系统、写 class 与 color-scheme", () => {
  assert.ok(has("components/theme-script.ts"), "components/theme-script.ts 不存在");
  const src = read("components/theme-script.ts");
  assert.match(src, /export const THEME_STORAGE_KEY = "[^"]+"/, "缺存储键常量");
  assert.ok(src.includes("localStorage"), "脚本没读 localStorage");
  assert.ok(src.includes("prefers-color-scheme"), "脚本没跟随系统");
  assert.ok(src.includes("classList"), "脚本没写 class");
  assert.ok(src.includes("colorScheme"), "脚本没同步 color-scheme");
});

test("layout 在首次绘制前注入脚本，并抑制 hydration 警告", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.includes("suppressHydrationWarning"), "html 缺 suppressHydrationWarning");
  assert.ok(layout.includes("themeScript"), "layout 没引用 themeScript");
  assert.ok(layout.includes("dangerouslySetInnerHTML"), "脚本没内联进 head");
  assert.ok(layout.includes("<SiteHeader"), "layout 没渲染 SiteHeader");
  assert.ok(layout.includes("<SiteFooter"), "layout 没渲染 SiteFooter");
});

test("暗色下原生控件跟随：.dark 声明 color-scheme: dark", () => {
  const css = read("app/globals.css").toLowerCase();
  const darkPart = css.slice(css.indexOf(".dark"));
  assert.ok(darkPart.includes("color-scheme: dark"), ".dark 缺 color-scheme: dark");
});

test("header 是 56px 吸顶，footer 存在", () => {
  assert.ok(has("components/site-header.tsx"), "components/site-header.tsx 不存在");
  const header = read("components/site-header.tsx");
  assert.ok(header.includes("h-14"), "header 缺 h-14（56px）");
  assert.ok(header.includes("sticky"), "header 缺 sticky");
  assert.ok(has("components/site-footer.tsx"), "components/site-footer.tsx 不存在");
});

test("主题切换按钮有可访问名称且是 client 组件", () => {
  assert.ok(has("components/theme-toggle.tsx"), "components/theme-toggle.tsx 不存在");
  const toggle = read("components/theme-toggle.tsx");
  assert.ok(toggle.startsWith('"use client"'), "theme-toggle 缺 \"use client\"");
  assert.ok(/aria-label=/.test(toggle), "按钮缺 aria-label");
  assert.ok(/aria-pressed=/.test(toggle), "按钮缺 aria-pressed");
});

test("移动端有可展开的导航，不是只能看到 logo", () => {
  const header = read("components/site-header.tsx");
  assert.ok(/aria-expanded=\{/.test(header), "汉堡按钮缺 aria-expanded");
  assert.ok(/aria-controls="[^"]+"/.test(header), "汉堡按钮缺 aria-controls");
  assert.ok(/sm:hidden/.test(header), "移动端导航面板没有 sm:hidden 限定");
});
