import Image from "next/image";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import { formatPerDay } from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

type PickRowProps = {
  entry: PickEntry;
  /** 这一批里 stars/天 排前 10 */
  hot: boolean;
  /** 站内已有深度评测时传 slug，行内会多一个「已跑过」入口 */
  projectSlug?: string;
};

export function PickRow({ entry, hot, projectSlug }: PickRowProps) {
  return (
    <li className="relative border-b border-line transition-colors duration-150 hover:bg-surface">
      <div className="flex gap-3.5 py-3.5 sm:gap-4">
        {entry.avatar ? (
          <Image
            src={entry.avatar}
            alt=""
            width={40}
            height={40}
            className="mt-0.5 size-10 shrink-0 border border-line object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-10 shrink-0 place-items-center border border-line font-serif text-small text-muted"
          >
            {entry.name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-x-2.5">
            {/* 链接只包名字，再用 after 铺满整行：整行可点，但可访问名只有一个项目名 */}
            <a
              href={`https://github.com/${entry.repo}`}
              rel="noopener"
              target="_blank"
              className="break-words font-serif text-body font-semibold text-ink after:absolute after:inset-0 after:content-[''] hover:text-accent"
            >
              {entry.name}
            </a>
            {projectSlug ? (
              <a
                href={`/projects/${projectSlug}`}
                className="relative z-10 shrink-0 font-mono text-micro text-accent"
              >
                已跑过 →
              </a>
            ) : null}
            <span className="min-w-0 truncate font-mono text-micro text-muted">{entry.repo}</span>
          </div>

          <p lang="en" className="mt-0.5 line-clamp-2 text-small text-muted">
            {entry.description}
          </p>

          {entry.why ? (
            <p className="mt-1.5 border-l-2 border-accent pl-2 text-small text-ink">{entry.why}</p>
          ) : null}

          {/* 375px 一行放不下五项，手机上只留星数、语言、涨速 */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-micro text-muted">
            <span className="tabular-nums sm:hidden">★ {formatStars(entry.stars)}</span>
            {entry.language ? <span>{entry.language}</span> : null}
            {/* ⑂ 是 U+2442，多数中文字体没有这个字形，渲染成一个看不懂的短横 */}
            <span className="hidden tabular-nums sm:inline">fork {formatStars(entry.forks)}</span>
            <span className="hidden tabular-nums sm:inline">
              更新 {formatDate(entry.pushedAt)}
            </span>
            {hot ? (
              <span className="text-accent tabular-nums">{formatPerDay(entry.starsPerDay)}</span>
            ) : null}
            {entry.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="hidden border border-line px-1 leading-relaxed sm:inline">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden shrink-0 pl-4 text-right sm:block">
          <span className="block font-serif text-h2 leading-none tabular-nums text-ink">
            {formatStars(entry.stars)}
          </span>
          <span className="mt-1 block font-mono text-micro text-muted">stars</span>
        </div>
      </div>
    </li>
  );
}
