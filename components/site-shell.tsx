import type { ReactNode } from "react";

/**
 * 三栏壳。掘金的做法是「灰底 + 若干白卡片」：左栏和 feed 各自是一块白面板，
 * 右栏是几张独立卡片。宽度常量在 lib/layout.ts，这里的 className 必须是
 * 字面量——Tailwind v4 不扫模板字符串。
 */
const SHELL_CLASS =
  "grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5 xl:grid-cols-[180px_minmax(0,1fr)_260px]";

/** 没有右栏时把那一列真正去掉，不然 feed 会在 260px 空白旁边收窄 */
const SHELL_NO_RIGHT_CLASS =
  "grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-5";

type SiteShellProps = {
  left: ReactNode;
  /** 右栏是可选的：首页只放精选，不再塞个人信息 */
  right?: ReactNode;
  children: ReactNode;
};

export function SiteShell({ left, right, children }: SiteShellProps) {
  return (
    <div data-shell className={right ? SHELL_CLASS : SHELL_NO_RIGHT_CLASS}>
      {/*
        aside 不能加 self-start：那样它会被收缩到内容高度，里面的 sticky 元素
        没有可移动的空间，滚起来就跟着走了（实测 railTop = -351）。
        保持默认 stretch，aside 撑到整行高，sticky 才有行程。
      */}
      <aside data-shell-left className="min-w-0">
        <div className="max-md:-mx-5 max-md:px-5 md:sticky md:top-[76px]">
          <div className="panel p-2 max-md:p-0">{left}</div>
        </div>
      </aside>

      {/*
        feed 面板不能加 overflow-hidden：那会把它变成 sticky 的包含块，
        里面 top-[60px] 的筛选行就按面板顶算，被推下去 60px 盖住第一行。
        圆角靠 panel 自己的 border-radius，不靠裁剪。
      */}
      <div data-shell-feed className="panel min-w-0">
        {children}
      </div>

      {right ? (
        <aside data-shell-right className="hidden min-w-0 xl:block">
          <div className="sticky top-[76px] space-y-3">{right}</div>
        </aside>
      ) : null}
    </div>
  );
}

/** md 以下没有右栏，个人信息降到 feed 末尾 */
export function ShellStrip({ children }: { children: ReactNode }) {
  return <div className="mt-3 xl:hidden">{children}</div>;
}
