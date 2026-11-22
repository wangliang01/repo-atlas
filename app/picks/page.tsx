import type { Metadata } from "next";
import { PickList, type PickView } from "@/components/pick-list";
import { getAllPicks, getPickCategories } from "@/lib/content";

export const metadata: Metadata = {
  title: "精选 | Repo Atlas",
  description: "从 HelloGitHub 里挑出来的项目，每条附一句我自己的判断。",
};

export default function PicksPage() {
  const picks = getAllPicks();
  const categories = getPickCategories(picks);

  const entries: PickView[] = picks.flatMap((issue) =>
    issue.entries.map((entry) => ({ ...entry, issue: issue.issue })),
  );

  return (
    <div className="wrap py-10 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="font-mono text-micro text-muted">精选</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">值得看一眼的项目</h1>
        <p className="mt-2 text-body text-muted">
          {entries.length} 条 · 条目来自 HelloGitHub，那句判断是我自己写的
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="mt-10 text-body text-muted">还没有精选。跑一次导入，挑几条写判断。</p>
      ) : (
        <PickList entries={entries} categories={categories} />
      )}
    </div>
  );
}
