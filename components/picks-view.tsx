"use client";

import { useEffect, useRef, useState } from "react";
import { PickRow } from "@/components/pick-row";
import { RailList } from "@/components/rail-list";
import { SiteShell } from "@/components/site-shell";
import { formatDate } from "@/lib/date";
import {
  DEFAULT_FILTER,
  domainsOf,
  filterPicks,
  formsOf,
  pickDomains,
  risingRepos,
  sameDay,
  type PickDetailInfo,
  type PickFilter,
} from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

/** 一屏先放 12 条，剩下的滚到底再追加。26 条时正好两屏半 */
const PAGE_SIZE = 12;

type PicksViewProps = {
  entries: PickEntry[];
  /** 这份快照的同步日期，用来判断谁是新上榜 */
  syncedAt: Date;
  /** repo（小写）→ 站内详情页信息 */
  details: Record<string, PickDetailInfo>;
};

export function PicksView({ entries, syncedAt, details }: PicksViewProps) {
  const [filter, setFilter] = useState<PickFilter>(DEFAULT_FILTER);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const domains = pickDomains(entries, details);
  const visible = filterPicks(entries, filter, details);
  const rising = risingRepos(entries);
  const risingCount = rising.size;

  const today = entries.filter((entry) => sameDay(entry.firstSeen, syncedAt)).map((entry) => entry.repo);
  // 建台账的第一天所有条目都是「新」，全标等于没标
  const fresh = new Set(today.length > 0 && today.length < entries.length ? today : []);

  // 换筛选条件就回到第一屏，否则会带着上一次翻的页数
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [filter.domain, filter.risingOnly]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (records) => {
        if (records.some((record) => record.isIntersecting)) {
          setLimit((current) => current + PAGE_SIZE);
        }
      },
      // 提前 200px 触发，滚到底之前就接上，不会看到空白
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible.length]);

  const shown = visible.slice(0, limit);
  const remaining = visible.length - shown.length;

  return (
    <SiteShell
      left={
        <RailList
          title="领域"
          items={domains.map((domain) => ({
            label: domain.label,
            count: domain.count,
            pressed: filter.domain === domain.label,
            onSelect: () => setFilter((current) => ({ ...current, domain: domain.label })),
          }))}
        />
      }
    >
      {/* 掘金把排序/筛选放在白卡顶部当标签行，滚动时吸附在 header 下面 */}
      <div className="sticky top-[60px] z-30 flex items-center gap-4 rounded-t-[4px] border-b border-line bg-surface/95 px-5 backdrop-blur">
        <button
          type="button"
          aria-pressed={filter.risingOnly}
          onClick={() => setFilter((current) => ({ ...current, risingOnly: !current.risingOnly }))}
          className={`relative flex items-center gap-1.5 py-3 text-small transition-colors duration-150 ${
            filter.risingOnly
              ? "font-medium text-accent-ink"
              : "text-ink/70 hover:text-ink"
          }`}
        >
          只看涨得快
          <span className="text-micro tabular-nums text-muted">{risingCount}</span>
          {filter.risingOnly ? (
            <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
          ) : null}
        </button>

        <p aria-live="polite" className="ml-auto text-micro text-muted tabular-nums">
          {visible.length} 个 · {formatDate(syncedAt)} 同步
        </p>
      </div>

      <ul>
        {shown.map((entry) => {
          const detail = details[entry.repo.toLowerCase()];
          return (
            <PickRow
              key={entry.repo}
              entry={entry}
              hot={rising.has(entry.repo)}
              fresh={fresh.has(entry.repo)}
              href={detail ? `/picks/${detail.slug}` : undefined}
              summaryZh={detail?.summary}
              domains={detail?.domains ?? domainsOf(entry, details)}
              forms={detail?.forms ?? formsOf(entry, details)}
            />
          );
        })}
      </ul>

      {visible.length === 0 ? (
        <p className="px-5 py-10 text-small text-muted">这个筛选下还没有条目。</p>
      ) : null}

      {remaining > 0 ? (
        <div ref={sentinelRef} className="border-t border-line px-5 py-4 text-center">
          {/* 滚动到底自动追加；按钮是给键盘和关掉 IntersectionObserver 的环境兜底 */}
          <button
            type="button"
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
            className="text-small text-accent-ink hover:underline"
          >
            加载更多（还有 {remaining} 个）
          </button>
        </div>
      ) : null}
    </SiteShell>
  );
}
