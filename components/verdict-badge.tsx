import type { ProjectFrontmatter } from "@/lib/schema";

const LABEL: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "推荐",
  watch: "观望",
  avoid: "别碰",
};

const STYLE: Record<ProjectFrontmatter["verdict"], string> = {
  recommend: "bg-accent text-white",
  watch: "border border-line text-muted",
  avoid: "border border-line text-muted line-through",
};

export function VerdictBadge({ verdict }: { verdict: ProjectFrontmatter["verdict"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center px-1.5 py-0.5 font-mono text-micro tracking-[0.08em] ${STYLE[verdict]}`}
    >
      {LABEL[verdict]}
    </span>
  );
}
