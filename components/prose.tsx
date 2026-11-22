import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { slugify } from "@/lib/mdx";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div data-prose className="min-w-0 max-w-[var(--measure)] text-body text-ink">
      {children}
    </div>
  );
}

// 标题的 id 必须和目录用同一个 slugify，否则点目录跳不过去
export function toText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return toText(node.props.children);
  return "";
}

// MDX 正文的排版：数值取自 juejin.cn 文章页实测，只覆盖用得到的标签
export const proseComponents = {
  // 22px/700，下边框而不是上边框——掘金靠这条细线切段，不靠留白
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      id={slugify(toText(children))}
      className="mt-[35px] mb-2.5 scroll-mt-24 border-b border-line pb-3 text-prose-h2 font-bold text-ink first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      id={slugify(toText(children))}
      className="mt-[35px] mb-2.5 scroll-mt-24 pb-1 text-prose-h3 font-bold text-ink"
    >
      {children}
    </h3>
  ),
  // 掘金正文是 #252933 近黑色，不是灰色；灰色只留给 meta 和次要信息
  p: (props: ComponentPropsWithoutRef<"p">) => <p {...props} className="mt-[22px] text-ink" />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-[22px] list-disc pl-7 text-ink" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="mt-[22px] list-decimal pl-7 text-ink" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-bold text-ink" />
  ),
  // 灰底 + 4px 竖线，字号跟正文一样大；掘金这里不用小字
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="mt-[22px] border-l-4 border-quote-line bg-surface-2 px-[23px] py-px text-muted"
    />
  ),
  // 掘金用 border-bottom 当下划线：比 text-decoration 更贴基线，不会切到汉字下沿
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="border-b border-link-line text-accent-ink hover:border-accent-ink"
      rel="noopener"
      target="_blank"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-[22px] overflow-x-auto rounded-[4px] border border-line bg-surface-2 p-4 font-mono text-small leading-relaxed"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => <code {...props} className="font-mono" />,
  // 375 下 w-full 会把三列中文挤成每行 7 个字，宁可让表格横向滚
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-[22px] overflow-x-auto">
      <table {...props} className="w-full min-w-[440px] border-collapse text-small" />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => <thead {...props} />,
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border border-table-line bg-table-head-bg px-2 py-3 text-left font-bold text-table-head-ink"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border border-table-line px-2 py-3 align-top text-ink" />
  ),
  // 截图走这里：不加宽度约束，一张 2 倍图会把正文撑破 720px
  img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element -- 正文图是运行时才知道的 MDX 内容，拿不到宽高，next/image 的必填尺寸给不出来
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="mt-[22px] w-full rounded-[4px] border border-line"
    />
  ),
  figure: (props: ComponentPropsWithoutRef<"figure">) => (
    <figure {...props} className="mt-[22px]" />
  ),
  figcaption: (props: ComponentPropsWithoutRef<"figcaption">) => (
    <figcaption {...props} className="mt-2 text-micro text-muted" />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr {...props} className="my-8 border-line" />,
};
