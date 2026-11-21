import Link from "next/link";
import { VerdictBadge } from "@/components/verdict-badge";
import { SETUP_LABEL } from "@/lib/labels";
import type { Project } from "@/lib/content";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { slug, data } = project;

  return (
    <Link href={`/projects/${slug}`} className="group block">
      {/* 真截图还没截：先用索引卡占位，版式与将来一致 */}
      <div className="relative aspect-[16/10] border border-line bg-bg p-3">
        <span className="block truncate font-mono text-micro text-muted">{data.repo}</span>
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-display text-line">
          NO.{String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-3 left-3 font-mono text-micro text-muted">{data.license}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="min-w-0 truncate text-body font-medium text-ink group-hover:text-accent">
          {data.name}
        </h3>
        <VerdictBadge verdict={data.verdict} />
      </div>
      <p className="mt-1 text-small text-muted">{data.tagline}</p>
      <p className="mt-2 font-mono text-micro text-muted tabular-nums">
        {SETUP_LABEL[data.setupTime]} · {data.language}
      </p>
    </Link>
  );
}
