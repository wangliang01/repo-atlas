// 三栏的宽度数字只在这里算一次；components/site-shell.tsx 里的 className 是字面量
// （Tailwind 只认字面量），lib/layout.test.ts 负责把两边对起来。
export const CONTAINER = 1200;
/** ≥768px 的左右内边距，和 globals.css 的 .wrap 一致 */
export const PADDING = 24;
/** <768px 的左右内边距 */
export const PADDING_MOBILE = 20;

export const XL = { left: 200, right: 280, gap: 40 } as const;
export const MD = { left: 160, gap: 32 } as const;

export type ShellBreakpoint = "xl" | "md" | "sm";

/** 某个视口宽度下中栏（feed）能拿到多少 px */
export function feedWidth(viewport: number, breakpoint: ShellBreakpoint): number {
  const padding = viewport >= 768 ? PADDING : PADDING_MOBILE;
  const content = Math.min(viewport, CONTAINER) - padding * 2;
  if (breakpoint === "xl") return content - XL.left - XL.right - XL.gap * 2;
  if (breakpoint === "md") return content - MD.left - MD.gap;
  return content;
}
