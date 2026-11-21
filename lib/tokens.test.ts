import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");

const LIGHT: Record<string, string> = {
  "--bg": "#faf9f6",
  "--surface": "#ffffff",
  "--ink": "#1a1917",
  "--muted": "#6e6a63",
  "--line": "#e6e2d9",
  "--accent": "#c4442c",
  "--accent-soft": "#f6e7e2",
};

const DARK: Record<string, string> = {
  "--bg": "#121211",
  "--surface": "#1a1a18",
  "--ink": "#edeae3",
  "--muted": "#9a958b",
  "--line": "#2a2a27",
  "--accent": "#e4694f",
  "--accent-soft": "#2b1d19",
};

const SIZES: Record<string, string> = {
  "--text-display": "40px",
  "--text-h1": "32px",
  "--text-h2": "24px",
  "--text-body": "16px",
  "--text-small": "13px",
  "--text-micro": "12px",
};

test("globals.css 声明了 light 与 dark 两套颜色 token", () => {
  assert.ok(existsSync(new URL("app/globals.css", root)), "app/globals.css 不存在");
  const css = read("app/globals.css").toLowerCase();
  const darkStart = css.indexOf(".dark");
  assert.ok(darkStart > -1, "缺少 .dark 选择器");
  const lightPart = css.slice(0, darkStart);
  const darkPart = css.slice(darkStart);

  for (const [name, value] of Object.entries(LIGHT)) {
    assert.ok(
      new RegExp(`${name}\\s*:\\s*${value}`).test(lightPart),
      `light 缺少 ${name}: ${value}`,
    );
  }
  for (const [name, value] of Object.entries(DARK)) {
    assert.ok(
      new RegExp(`${name}\\s*:\\s*${value}`).test(darkPart),
      `dark 缺少 ${name}: ${value}`,
    );
  }
});

test("字号只有六档刻度，且容器宽度 1200px", () => {
  const css = read("app/globals.css");
  for (const [name, value] of Object.entries(SIZES)) {
    assert.ok(css.includes(`${name}: ${value}`), `缺少字号 token ${name}: ${value}`);
  }
  assert.match(css, /--container:\s*1200px/, "缺少 --container: 1200px");
});

test("layout 使用 zh-CN 与 next/font 的四个字体族", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /lang="zh-CN"/, 'html 缺少 lang="zh-CN"');
  for (const family of ["Inter", "JetBrains_Mono", "Noto_Sans_SC", "Noto_Serif_SC"]) {
    assert.ok(layout.includes(family), `next/font 未加载 ${family}`);
  }
});

test("tsconfig 开启 strict", () => {
  const tsconfig = JSON.parse(read("tsconfig.json"));
  assert.equal(tsconfig.compilerOptions?.strict, true);
});
