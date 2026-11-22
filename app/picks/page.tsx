import type { Metadata } from "next";
import { PickList } from "@/components/pick-list";
import { getPicksSnapshot } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/picks";

export const metadata: Metadata = {
  title: "精选 | Repo Atlas",
  description: "从 GitHub 上抓的 AI 项目雷达：按 stars 和涨星速度排，每周同步一次。",
};

export default function PicksPage() {
  const snapshot = getPicksSnapshot();

  if (!snapshot) {
    return (
      <div className="wrap py-10 md:py-16">
        <h1 className="font-serif text-h1 font-semibold text-ink">最近值得看的 AI 项目</h1>
        <p className="mt-4 text-body text-muted">还没有快照。跑一次 pnpm sync:picks，再回来看。</p>
      </div>
    );
  }

  const entries = snapshot.entries;
  const total = entries.reduce((sum, entry) => sum + entry.stars, 0);

  return (
    <div className="wrap py-10 md:py-14">
      <header className="border-b border-line pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-mono text-micro text-muted">精选</p>
          <p className="font-mono text-micro text-muted tabular-nums">
            {formatDate(snapshot.syncedAt)} 同步
          </p>
        </div>

        <h1 className="mt-2 text-balance font-serif text-h1 font-semibold text-ink">
          最近值得看的 AI 项目
        </h1>

        <p className="mt-2 max-w-[var(--measure)] text-small text-muted">
          {entries.length} 个 · 合计 {formatStars(total)} stars · 排序只看热度，不看好坏。
        </p>
      </header>

      <PickList entries={entries} />
    </div>
  );
}
