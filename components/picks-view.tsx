"use client";

import { useState } from "react";
import { PickRow } from "@/components/pick-row";
import { ProfileCard } from "@/components/profile-card";
import { RailList } from "@/components/rail-list";
import { ShellStrip, SiteShell } from "@/components/site-shell";
import { DEFAULT_FILTER, filterPicks, pickCategories, risingRepos, type PickFilter } from "@/lib/picks";
import type { Profile } from "@/lib/profile";
import type { PickEntry } from "@/lib/schema";

type PicksViewProps = {
  entries: PickEntry[];
  profile: Profile;
  updatedAt: Date;
};

export function PicksView({ entries, profile, updatedAt }: PicksViewProps) {
  const [filter, setFilter] = useState<PickFilter>(DEFAULT_FILTER);

  const categories = pickCategories(entries);
  const visible = filterPicks(entries, filter);
  const rising = risingRepos(entries);
  const risingCount = rising.size;

  return (
    <SiteShell
      left={
        <RailList
          title="分类"
          items={categories.map((category) => ({
            label: category.label,
            count: category.count,
            pressed: filter.category === category.label,
            onSelect: () => setFilter((current) => ({ ...current, category: category.label })),
          }))}
        />
      }
      right={<ProfileCard profile={profile} updatedAt={updatedAt} variant="rail" />}
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
          {visible.length} 个
        </p>
      </div>

      <ul>
        {visible.map((entry) => (
          <PickRow key={entry.repo} entry={entry} hot={rising.has(entry.repo)} />
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="px-5 py-10 text-small text-muted">这个筛选下还没有条目。</p>
      ) : null}

      <ShellStrip>
        <ProfileCard profile={profile} updatedAt={updatedAt} variant="strip" />
      </ShellStrip>
    </SiteShell>
  );
}
