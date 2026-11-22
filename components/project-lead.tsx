import Link from "next/link";
import { VerdictBadge } from "@/components/verdict-badge";
import { SETUP_LABEL } from "@/lib/labels";
import { formatStars } from "@/lib/format";
import type { Project } from "@/lib/content";

/**
 * 本期条目。以前这里是一张 16:10 的「NO.01」占位框，截图还没截，
 * 结果首屏三个空框看着像图挂了——改成一行把真信息摆满：
 * 序号、结论、一句话、上手时间、语言、协议、星数。
 */
export function ProjectLead({ project, index }: { project: Project; index: number }) {
  const { slug, data } = project;

  return (
    <Link
      href={`/projects/${slug}`}
      className="group grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-3 border-b border-line py-4 transition-colors duration-150 hover:bg-surface sm:grid-cols-[2rem_minmax(0,1fr)_auto]"
    >
      <span
        aria-hidden
        className="pt-1 font-mono text-micro text-muted tabular-nums"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-serif text-body font-semibold text-ink group-hover:text-accent">
            {data.name}
          </span>
          <VerdictBadge verdict={data.verdict} />
        </span>
        <span className="mt-1 block text-small text-muted">{data.tagline}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 font-mono text-micro text-muted tabular-nums">
          <span>{SETUP_LABEL[data.setupTime]}</span>
          <span aria-hidden>·</span>
          <span>{data.language}</span>
          <span aria-hidden>·</span>
          <span>{data.license}</span>
          {/* 手机上没第三栏，星数接在协议后面，不然会单独掉到下一行 */}
          <span className="sm:hidden">· {formatStars(data.stars)}</span>
        </span>
      </span>

      <span className="hidden font-mono text-small text-muted tabular-nums sm:mt-1 sm:block sm:text-right">
        {formatStars(data.stars)}
      </span>
    </Link>
  );
}
