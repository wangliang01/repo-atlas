import { codeToHtml } from "shiki";
import { findFences, type Fence } from "./mdx.ts";

const THEMES = { light: "github-light", dark: "github-dark" };

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const encode = (value: string) => Buffer.from(value, "utf8").toString("base64");

// 双主题：span 上带 --shiki-light / --shiki-dark，暗色由 CSS 变量切，不重新高亮
export async function highlightCode(code: string, lang: string): Promise<string> {
  const render = (language: string) =>
    codeToHtml(code, { lang: language, themes: THEMES, defaultColor: false });

  let html: string;
  try {
    html = await render(lang);
  } catch {
    html = await render("text");
  }

  return html.replace("<pre", `<pre data-language="${escapeAttr(lang)}"`);
}

function toElement(fence: Fence, html: string): string {
  const attrs = [
    `lang="${escapeAttr(fence.lang)}"`,
    fence.filename ? `filename="${escapeAttr(fence.filename)}"` : "",
    fence.lineNumbers ? "lineNumbers" : "",
    `html="${encode(html)}"`,
    `code="${encode(fence.code)}"`,
  ].filter(Boolean);

  return `<CodeBlock ${attrs.join(" ")} />`;
}

// 把 ``` 围栏换成 <CodeBlock />，高亮在构建时做完，页面不带高亮库
export async function preprocessCode(body: string): Promise<string> {
  const fences = findFences(body);
  if (fences.length === 0) return body;

  let out = "";
  let cursor = 0;

  for (const fence of fences) {
    out += body.slice(cursor, fence.index);
    out += `\n\n${toElement(fence, await highlightCode(fence.code, fence.lang))}\n\n`;
    cursor = fence.index + fence.raw.length;
  }

  return out + body.slice(cursor);
}
