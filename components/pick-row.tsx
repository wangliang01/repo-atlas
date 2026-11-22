import Image from "next/image";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import { formatPerDay } from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

type PickRowProps = {
  entry: PickEntry;
  /** 这一批里 stars/天 排前 10 */
  hot: boolean;
};

/**
 * 掘金式条目：标题 / 两行描述 / meta 一行（头像 + 仓库 + 语言 + 标签），
 * 右侧一列放星数与涨速当扫描锚点。原来右下角那个大衬线数字跟着衬线一起没了。
 */
export function PickRow({ entry, hot }: PickRowProps) {
  return (
    <li className="relative border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-surface-2">
      <div className="flex gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* 链接只包名字，再用 after 铺满整行：整行可点，但可访问名只有一个项目名 */}
            <a
              href={`https://github.com/${entry.repo}`}
              rel="noopener"
              target="_blank"
              className="break-words text-body font-semibold leading-6 text-ink after:absolute after:inset-0 after:content-[''] hover:text-accent-ink"
            >
              {entry.name}
            </a>
          </div>

          <p lang="en" className="mt-1 line-clamp-2 text-small text-muted">
            {entry.description}
          </p>

          {entry.why ? (
            <p className="mt-1.5 border-l-2 border-accent pl-2 text-small text-ink">{entry.why}</p>
          ) : null}

          <div className="mt-2.5 flex items-center gap-2.5 text-micro text-muted">
            {entry.avatar ? (
              <Image
                src={entry.avatar}
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 rounded-[2px] object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-5 shrink-0 place-items-center rounded-[2px] bg-surface-2 text-micro text-muted"
              >
                {entry.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 truncate">{entry.repo}</span>
            {entry.language ? (
              <>
                <span aria-hidden="true" className="text-line">
                  ·
                </span>
                <span className="shrink-0">{entry.language}</span>
              </>
            ) : null}
            <span aria-hidden="true" className="hidden shrink-0 text-line lg:inline">
              ·
            </span>
            <span className="hidden shrink-0 tabular-nums lg:inline">
              更新 {formatDate(entry.pushedAt)}
            </span>

            <span className="ml-auto flex shrink-0 gap-1.5">
              {entry.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="hidden rounded-[2px] bg-surface-2 px-1.5 py-0.5 sm:inline"
                >
                  {topic}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="block text-body font-semibold leading-6 tabular-nums text-ink">
            {formatStars(entry.stars)}
          </span>
          {/* 同一列不能一行写「stars」一行写涨速，两种东西并排会看错 */}
          {hot ? (
            <span className="block text-micro tabular-nums text-accent-ink">
              {formatPerDay(entry.starsPerDay)}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
