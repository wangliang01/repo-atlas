import type { ReactNode } from "react";

/**
 * 图注不是可选项：截图和示意图离开上下文就没人知道看的是哪一步。
 * 图注用无衬线——等宽字体配中文会把字距拉开，读起来像报错信息。
 */
export function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="mt-6">
      <div className="overflow-x-auto rounded-[4px] border border-line">{children}</div>
      {caption ? <figcaption className="mt-2 text-micro text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
