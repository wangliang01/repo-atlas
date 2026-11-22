import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-[var(--measure)] text-body text-ink">{children}</div>;
}

// MDX 正文的排版：只覆盖用得到的标签，不用 typography 插件
export const proseComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-12 border-t border-line pt-6 font-serif text-h2 font-semibold text-ink first:mt-0 first:border-t-0 first:pt-0"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="mt-8 text-body font-semibold text-ink" />
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
      className="text-accent underline decoration-line underline-offset-4"
      rel="noopener"
      target="_blank"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-6 overflow-x-auto border border-line bg-surface p-4 font-mono text-small leading-relaxed"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code {...props} className="font-mono text-small" />
  ),
};
