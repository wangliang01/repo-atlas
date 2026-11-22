import { VERDICT_LABEL } from "@/lib/labels";
import type { ProjectFrontmatter } from "@/lib/schema";

/*
  推荐用 accent-fill 做底：白字压在 #1e80ff 上只有 3.76:1，
  压 #1668c9 是 7.05:1；暗色下 accent-ink 是浅蓝，白字压不上去，所以单独一个 fill。
*/
const STYLE: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "bg-accent-fill text-white",
  watch: "bg-surface-2 text-muted",
  avoid: "bg-surface-2 text-muted line-through",
};

export function VerdictBadge({ verdict }: { verdict: ProjectFrontmatter["verdict"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[2px] px-1.5 py-0.5 text-micro ${STYLE[verdict]}`}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
