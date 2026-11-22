export const CONTAINER = 1200;
export const PADDING = 24;
export const PADDING_MOBILE = 20;

/** 掘金实测：左 180 / 右 270 / 列间距 20 */
export const XL = { left: 180, right: 260, gap: 20 } as const;
export const MD = { left: 180, gap: 20 } as const;

export type ShellBreakpoint = "sm" | "md" | "xl";

export function feedWidth(viewport: number, breakpoint: ShellBreakpoint): number {
  const padding = viewport >= 768 ? PADDING : PADDING_MOBILE;
  const content = Math.min(viewport, CONTAINER) - padding * 2;
  if (breakpoint === "xl") return content - XL.left - XL.right - XL.gap * 2;
  if (breakpoint === "md") return content - MD.left - MD.gap;
  return content;
}
