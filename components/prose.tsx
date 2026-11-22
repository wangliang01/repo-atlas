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

// MDX 正文的排版：只覆盖用得到的标签，不用 typography 插件
export const proseComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      id={slugify(toText(children))}
      className="mt-12 scroll-mt-24 border-t border-line pt-6 text-h2 font-semibold text-ink first:mt-0 first:border-t-0 first:pt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      id={slugify(toText(children))}
      className="mt-8 scroll-mt-24 text-body font-semibold text-ink"
    >
      {children}
    </h3>
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p {...props} className="mt-4 text-muted" />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-4 list-disc space-y-2 pl-5 text-muted" />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol {...props} className="mt-4 list-decimal space-y-2 pl-5 text-muted" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li {...props} className="pl-1" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-medium text-ink" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote {...props} className="mt-6 border-l-2 border-accent pl-4 text-small text-muted" />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="text-accent-ink underline decoration-line underline-offset-4"
      rel="noopener" target="_blank"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-6 overflow-x-auto rounded-[4px] border border-line bg-surface-2 p-4 font-mono text-small leading-relaxed"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="font-mono text-small" />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mt-6 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-small" />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead {...props} className="border-b border-line text-left" />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th {...props} className="py-2 pr-4 font-medium text-ink" />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border-b border-line py-2 pr-4 align-top text-muted" />
  ),
  // 截图走这里：不加宽度约束，一张 2 倍图会把正文撑破 720px
  img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
    // eslint-disable-next-line @next/next/no-img-element -- 正文图是运行时才知道的 MDX 内容，拿不到宽高，next/image 的必填尺寸给不出来
    <img
      {...props}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="mt-6 w-full rounded-[4px] border border-line"
    />
  ),
  figure: (props: ComponentPropsWithoutRef<"figure">) => <figure {...props} className="mt-6" />,
  figcaption: (props: ComponentPropsWithoutRef<"figcaption">) => (
    <figcaption {...props} className="mt-2 font-mono text-micro text-muted" />
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr {...props} className="mt-10 border-line" />,
};
