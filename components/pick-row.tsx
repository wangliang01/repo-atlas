import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import { formatPerDay } from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

type PickRowProps = {
  entry: PickEntry;
  /** 这一批里 stars/天 排前 10 */
  hot: boolean;
  /** 今天第一次上榜 */
  fresh?: boolean;
  /** 站内详情页；没有详情时卡片只展示，不跳 GitHub */
  href?: string;
  /** 详情页里的中文一句话；没有就退回 GitHub 原文 */
  summaryZh?: string;
  /** 主用途：决定左栏和筛选 */
  domains?: string[];
  /** 形态标签：Skill / MCP 服务 / CLI 等，不参与主分类 */
  forms?: string[];
  /** 身份标签：前端 / 自媒体 / 安全等；没有就不显示 */
  identities?: string[];
};

/**
 * 掘金式条目：标题 / 两行描述 / meta 一行（头像 + 仓库 + 语言 + 标签），
 * 右侧一列放星数与涨速当扫描锚点。原来右下角那个大衬线数字跟着衬线一起没了。
 */
export function PickRow({
  entry,
  hot,
  fresh = false,
  href,
  summaryZh,
  domains = [],
  forms = [],
  identities = [],
}: PickRowProps) {
  const titleClass = "break-words text-body font-semibold leading-6 text-ink";
  const summary = summaryZh ?? entry.description;
  return (
    <li className="relative border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-surface-2">
      <div className="flex gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* 链接只包名字，再用 after 铺满整行：整行可点，但可访问名只有一个项目名 */}
            {href ? (
              <Link
                href={href}
                className={`${titleClass} after:absolute after:inset-0 after:content-[''] hover:text-accent-ink`}
              >
                {entry.name}
              </Link>
            ) : (
              <span className={titleClass}>{entry.name}</span>
            )}
            {fresh ? (
              <span className="shrink-0 rounded-[2px] bg-accent-soft px-1.5 py-0.5 text-micro font-medium text-accent-ink">
                新上榜
              </span>
            ) : null}
            {!href ? (
              <span className="shrink-0 rounded-[2px] bg-surface-2 px-1.5 py-0.5 text-micro text-muted">
                整理中
              </span>
            ) : null}
          </div>

          <p lang={summaryZh ? undefined : "en"} className="mt-1 line-clamp-2 text-small text-muted">
            {summary}
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

            {/* 一行三枚，每层只取首项：用途（灰）/ 形态（蓝）/ 身份（描边） */}
            <span className="ml-auto flex shrink-0 gap-1.5">
              {domains[0] ? (
                <span className="hidden rounded-[2px] bg-surface-2 px-1.5 py-0.5 sm:inline">
                  {domains[0]}
                </span>
              ) : null}
              {forms[0] ? (
                <span className="hidden rounded-[2px] bg-accent-soft px-1.5 py-0.5 text-accent-ink sm:inline">
                  {forms[0]}
                </span>
              ) : null}
              {identities[0] ? (
                <span className="hidden rounded-[2px] px-1.5 py-0.5 ring-1 ring-inset ring-line sm:inline">
                  {identities[0]}
                </span>
              ) : null}
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
