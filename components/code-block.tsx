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
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-3 py-2">
        <span className="truncate font-mono text-micro text-muted">{filename ?? lang}</span>
        <CopyButton text={source} />
      </figcaption>
      <div
        className="overflow-x-auto p-4 font-mono text-small"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </figure>
  );
}
