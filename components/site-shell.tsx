import type { ReactNode } from "react";

// 三栏的 className 必须是字面量——Tailwind v4 扫源码找类名，
// 模板串拼出来的 `grid-cols-[${n}px...]` 不会被生成。
// 数字在 lib/layout.ts，lib/layout.test.ts 负责把两边对上。
const SHELL_CLASS =
  "grid grid-cols-1 gap-8 md:grid-cols-[160px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[200px_minmax(0,1fr)_280px] xl:gap-10";

type SiteShellProps = {
  left: ReactNode;
  right: ReactNode;
  children: ReactNode;
};

/**
 * 掘金式三栏：左索引 / 中 feed / 右个人信息。
 * 三栏只在 xl 出现——1024 三栏会把 feed 压到 552px，精选行会重新溢出。
 * 右栏先消失（xl→md），左栏后消失（md→sm 变横向滚动条）。
 */
export function SiteShell({ left, right, children }: SiteShellProps) {
  return (
    <div data-shell className={SHELL_CLASS}>
      {/*
        aside 不能加 self-start：那样它会被收缩到内容高度，里面的 sticky 元素
        没有可移动的空间，滚起来就跟着走了（实测 railTop = -351）。
        保持默认 stretch，aside 撑到整行高，sticky 才有行程。
      */}
      <aside data-shell-left className="min-w-0">
        <div className="max-md:-mx-5 max-md:px-5 md:sticky md:top-[72px]">{left}</div>
      </aside>

      <div data-shell-feed className="min-w-0">
        {children}
      </div>

      <aside data-shell-right className="hidden min-w-0 xl:block">
        <div className="sticky top-[72px]">{right}</div>
      </aside>
    </div>
  );
}

/** xl 以下右栏隐藏，个人信息改在 feed 末尾横排 */
export function ShellStrip({ children }: { children: ReactNode }) {
  return <div className="mt-12 xl:hidden">{children}</div>;
}
