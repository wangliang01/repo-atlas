import Link from "next/link";
import { VerdictBadge } from "@/components/verdict-badge";
import { SETUP_LABEL } from "@/lib/labels";
import { formatStars } from "@/lib/format";
import type { Project } from "@/lib/content";

/** 「我跑过、并给了结论的」一行：名字 + 结论 + 一句话 + 上手成本，右侧星数。 */
export function ProjectLead({ project }: { project: Project }) {
  const { slug, data } = project;

  return (
    <Link
      href={`/projects/${slug}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 border-b border-line px-5 py-4 transition-colors duration-150 last:border-b-0 hover:bg-surface-2"
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body font-semibold leading-6 text-ink group-hover:text-accent-ink">
            {data.name}
          </span>
          <VerdictBadge verdict={data.verdict} />
        </span>
        <span className="mt-1 block text-small text-muted">{data.tagline}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 text-micro text-muted tabular-nums">
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
