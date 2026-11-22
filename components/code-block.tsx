import { CopyButton } from "@/components/copy-button";

type CodeBlockProps = {
  lang: string;
  filename?: string;
  lineNumbers?: boolean;
  /** shiki 构建时产出的 HTML，base64 过的，避免 MDX 属性里出现引号 */
  html: string;
  /** 代码原文，base64 过的，供复制按钮使用 */
  code: string;
};

export function CodeBlock({ lang, filename, lineNumbers, html, code }: CodeBlockProps) {
  const rendered = Buffer.from(html, "base64").toString("utf8");
  const source = Buffer.from(code, "base64").toString("utf8");

  return (
    <figure
      className="code-block mt-6 overflow-hidden border border-line bg-surface"
      data-line-numbers={lineNumbers ? "true" : undefined}
    >
      <figcaption className="flex items-center gap-3 border-b border-line bg-bg/60 px-4 py-2">
        {/* 有文件名就不再标语言：lib/content.ts ts 连在一起像拼错了 */}
        <span className="truncate font-mono text-micro text-ink">{filename ?? lang}</span>
        <span className="ml-auto shrink-0">
          <CopyButton text={source} />
        </span>
      </figcaption>
      <div
        className="overflow-x-auto px-4 py-3.5 font-mono text-small leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </figure>
  );
}
