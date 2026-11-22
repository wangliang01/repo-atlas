import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf8");

const LIGHT: Record<string, string> = {
  "--bg": "#f2f3f5",
  "--surface": "#ffffff",
  "--surface-2": "#f7f8fa",
  "--ink": "#252933",
  "--muted": "#6b7280",
  "--line": "#e5e6eb",
  "--accent": "#1e80ff",
  "--accent-ink": "#1668c9",
  "--accent-fill": "#1668c9",
  "--accent-soft": "#eaf2ff",
};

const DARK: Record<string, string> = {
  "--bg": "#17181a",
  "--surface": "#232324",
  "--surface-2": "#2a2b2e",
  "--ink": "#e5e6eb",
  "--muted": "#9aa1ad",
  "--line": "#2f3033",
  "--accent": "#4098ff",
  "--accent-ink": "#6db2ff",
  "--accent-fill": "#1e6fd0",
  "--accent-soft": "#1b2b3f",
};

const SIZES: Record<string, string> = {
  "--text-display": "28px",
  "--text-h1": "24px",
  "--text-h2": "18px",
  "--text-body": "16px",
  "--text-small": "13px",
  "--text-micro": "12px",
};

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const c = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

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

test("换成掘金蓝之后仍然过 AA：正文、次要文字、蓝字、蓝底白字", () => {
  for (const [theme, tokens] of Object.entries({ light: LIGHT, dark: DARK })) {
    const surface = tokens["--surface"];
    assert.ok(
      contrast(tokens["--ink"], surface) >= 7,
      `${theme}: 正文 ${tokens["--ink"]} 在卡片上只有 ${contrast(tokens["--ink"], surface).toFixed(2)}:1`,
    );
    assert.ok(
      contrast(tokens["--muted"], surface) >= 4.5,
      `${theme}: 次要文字 ${tokens["--muted"]} 在卡片上只有 ${contrast(tokens["--muted"], surface).toFixed(2)}:1`,
    );
    assert.ok(
      contrast(tokens["--accent-ink"], surface) >= 4.5,
      `${theme}: 蓝字 ${tokens["--accent-ink"]} 在卡片上只有 ${contrast(tokens["--accent-ink"], surface).toFixed(2)}:1`,
    );
    assert.ok(
      contrast("#ffffff", tokens["--accent-fill"]) >= 4.5,
      `${theme}: 白字压 ${tokens["--accent-fill"]} 只有 ${contrast("#ffffff", tokens["--accent-fill"]).toFixed(2)}:1`,
    );
  }
});

test("品牌蓝 #1e80ff 只做填充，不做小字：它当文字只有 3.7:1", () => {
  const ratio = contrast(LIGHT["--accent"], LIGHT["--surface"]);
  assert.ok(ratio < 4.5, `#1e80ff 当文字已经达到 ${ratio.toFixed(2)}:1，可以简化掉 accent-ink 了`);
});

test("layout 使用 zh-CN 与 next/font 的三个字体族，衬线已移除", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /lang="zh-CN"/, 'html 缺少 lang="zh-CN"');
  for (const family of ["Inter", "JetBrains_Mono", "Noto_Sans_SC"]) {
    assert.ok(layout.includes(family), `next/font 未加载 ${family}`);
  }
  assert.equal(layout.includes("Noto_Serif_SC"), false, "衬线字体还在加载");
});

test("tsconfig 开启 strict", () => {
  const tsconfig = JSON.parse(read("tsconfig.json"));
  assert.equal(tsconfig.compilerOptions?.strict, true);
});
