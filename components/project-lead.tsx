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
      className="group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-line px-5 py-4 transition-colors duration-150 last:border-b-0 hover:bg-surface-2"
    >
      <span aria-hidden className="pt-0.5 text-micro tabular-nums text-muted">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body font-semibold leading-6 text-ink group-hover:text-accent-ink">
            {data.name}
          </span>
          <VerdictBadge verdict={data.verdict} />
        </span>
        <span className="mt-1 block text-small text-muted">{data.tagline}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-micro text-muted tabular-nums">
          {/* 分隔符和词绑在一个 span 里，换行时不会把「·」甩到下一行行首；
              协议名太长，375 上直接不显示，详情页里有 */}
          {[
            { text: SETUP_LABEL[data.setupTime], className: "whitespace-nowrap" },
            { text: data.language, className: "whitespace-nowrap" },
            { text: data.license, className: "hidden whitespace-nowrap sm:inline" },
          ].map((item, i) => (
            <span key={item.text} className={item.className}>
              {i > 0 ? (
                <span aria-hidden className="mr-2 text-line">
                  ·
                </span>
              ) : null}
              {item.text}
            </span>
          ))}
        </span>
      </span>

      <span className="shrink-0 text-right text-body font-semibold leading-6 tabular-nums text-ink">
        {formatStars(data.stars)}
      </span>
    </Link>
  );
}
