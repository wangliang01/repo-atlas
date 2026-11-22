import type { Metadata } from "next";
import { PicksView } from "@/components/picks-view";
import { getPicksSnapshot, getProjectSlugByRepo, getSiteCounts } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import { PROFILE } from "@/lib/profile";

export const metadata: Metadata = {
  title: "精选 | Repo Atlas",
  description: "从 GitHub 上抓的 AI 项目：按 stars 和涨星速度排，每周同步一次。",
};

export default function PicksPage() {
  const snapshot = getPicksSnapshot();
  const { updatedAt } = getSiteCounts();

  if (!snapshot) {
    return (
      <div className="wrap py-4 md:py-5">
        <div className="panel p-5">
          <h1 className="text-h1 font-semibold text-ink">最近值得看的 AI 项目</h1>
          <p className="mt-2 text-small text-muted">还没有快照。跑一次 pnpm sync:picks，再回来看。</p>
        </div>
      </div>
    );
  }

  const entries = snapshot.entries;
  const total = entries.reduce((sum, entry) => sum + entry.stars, 0);

  return (
    <div className="wrap py-4 md:py-5">
      <header className="panel flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 py-4">
        <div className="min-w-0">
          <h1 className="text-balance text-display font-semibold tracking-tight text-ink">
            最近值得看的 AI 项目
          </h1>
          <p className="mt-1 text-micro text-muted">
            {entries.length} 个 · 合计 {formatStars(total)} stars · 排序只看热度，不看好坏。
          </p>
        </div>

        <p className="shrink-0 text-micro text-muted tabular-nums">
          {formatDate(snapshot.syncedAt)} 同步
        </p>
      </header>

      <div className="mt-4">
        <PicksView
          entries={entries}
          profile={PROFILE}
          updatedAt={updatedAt}
          projectByRepo={Object.fromEntries(getProjectSlugByRepo())}
        />
      </div>
    </div>
  );
}
