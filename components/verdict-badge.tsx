import { VERDICT_LABEL } from "@/lib/labels";
import type { ProjectFrontmatter } from "@/lib/schema";

// 推荐用 bg 色做字色，不用 text-white：暗色下 accent 变亮，白字对比度只有 3.26:1，不合格
const STYLE: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "bg-accent text-bg",
  watch: "border border-line text-muted",
  avoid: "border border-line text-muted line-through",
};

export function VerdictBadge({ verdict }: { verdict: ProjectFrontmatter["verdict"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center px-1.5 py-0.5 font-mono text-micro ${STYLE[verdict]}`}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
