import Link from "next/link";
import { formatStars } from "@/lib/format";
import { formatPerDay } from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

/**
 * 右栏的「最近在扫」。首页只是钩子，完整 26 条在 /picks——
 * 所以这里只给名字、涨速、星数，不放描述。
 */
export function RisingPanel({
  entries,
  total,
  variant = "rail",
}: {
  entries: PickEntry[];
  total: number;
  /** strip 是塞在 feed 末尾的，不能再套一层白卡 */
  variant?: "rail" | "strip";
}) {
  return (
    <section
      aria-label="最近在扫"
      className={variant === "rail" ? "panel" : "border-t border-line"}
    >
      <div className="flex items-baseline justify-between px-4 pb-1 pt-3">
        <h2 className="text-small font-semibold text-ink">最近在扫</h2>
        <Link href="/picks" className="text-micro text-muted hover:text-accent-ink">
          全部 →
        </Link>
      </div>

      <ul className="pb-1">
        {entries.map((entry) => (
          <li key={entry.repo}>
            <a
              href={`https://github.com/${entry.repo}`}
              rel="noopener"
              target="_blank"
              className="block px-4 py-1.5 transition-colors duration-150 hover:bg-surface-2"
            >
              <span className="block truncate text-small text-ink">{entry.name}</span>
              <span className="block text-micro text-muted tabular-nums">
                <span className="text-accent-ink">{formatPerDay(entry.starsPerDay)}</span>
                <span className="ml-2">{formatStars(entry.stars)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="border-t border-line px-4 py-2 text-micro text-muted tabular-nums">
        共 {total} 个 · 每周同步
      </p>
    </section>
  );
}
