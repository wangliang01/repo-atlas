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
      className="code-block mt-[22px] overflow-hidden rounded-[6px] border border-[#30363d] bg-[#0d1117]"
      data-line-numbers={lineNumbers ? "true" : undefined}
    >
      {/* 头部比正文亮一档，用底色分层，不再靠分隔线 */}
      <figcaption className="flex h-9 items-center gap-2.5 border-b border-[#30363d] bg-[#161b22] px-3">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
        {/* 有文件名就不再标语言：lib/content.ts 连在一起像拼错了 */}
        <span className="truncate font-mono text-micro text-[#8b949e]">{filename ?? lang}</span>
        <span className="ml-auto shrink-0">
          <CopyButton text={source} tone="dark" />
        </span>
      </figcaption>
      <div
        className="overflow-x-auto px-4 py-3 font-mono text-small leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: rendered }}
      />
    </figure>
  );
}
