// 笔记正文的纯函数处理：标题提取、围栏解析、诚实小节切分。
// 这里不碰 React 和 shiki，方便直接用 node --test 验。

export type Heading = { depth: 2 | 3; text: string; id: string };

export type Fence = {
  /** 在原文中的起始下标，用于原位替换 */
  index: number;
  /** 整段围栏原文（含首尾反引号行） */
  raw: string;
  lang: string;
  filename?: string;
  lineNumbers: boolean;
  code: string;
};

export const UNRESOLVED_HEADING = "我还没搞懂的部分";

// 中文保留，拉丁转小写，空白变连字符，标点去掉——目录和标题必须用同一个函数
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[*`_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2];
    headings.push({ depth: match[1].length as 2 | 3, text, id: slugify(text) });
  }

  return headings;
}

export function findFences(body: string): Fence[] {
  const lines = body.split("\n");
  const fences: Fence[] = [];
  let offset = 0;
  let i = 0;

  while (i < lines.length) {
    const open = /^```([\w+#.-]*)(.*)$/.exec(lines[i]);
    if (!open) {
      offset += lines[i].length + 1;
      i += 1;
      continue;
    }

    const start = offset;
    const info = open[2].trim();
    const lang = open[1] || "text";
    const filename = /filename="([^"]*)"/.exec(info)?.[1];
    const lineNumbers = /\blines\b/.test(info);

    const codeLines: string[] = [];
    let j = i + 1;
    while (j < lines.length && !/^```\s*$/.test(lines[j])) {
      codeLines.push(lines[j]);
      j += 1;
    }

    const raw = lines.slice(i, Math.min(j + 1, lines.length)).join("\n");
    fences.push({
      index: start,
      raw,
      lang,
      filename,
      lineNumbers,
      code: codeLines.length > 0 ? `${codeLines.join("\n")}\n` : "",
    });

    offset = start + raw.length + 1;
    i = j + 1;
  }

  return fences;
}

// 「我还没搞懂的部分」是诚实度的唯一可见证明，缺了就不许构建
export function parseNoteSections(body: string): { main: string; unresolved: string } {
  const lines = body.split("\n");
  const index = lines.findIndex((line) => line.trim() === `## ${UNRESOLVED_HEADING}`);

  if (index === -1) {
    throw new Error(`笔记缺少「## ${UNRESOLVED_HEADING}」小节：写不清没搞懂什么，这篇就不该发`);
  }

  return {
    main: lines.slice(0, index).join("\n"),
    unresolved: lines.slice(index + 1).join("\n").trim(),
  };
}

// 中文按 350 字/分钟，英文按 200 词/分钟，向下取整到分钟，最少 1
export function readingTimeOf(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}
