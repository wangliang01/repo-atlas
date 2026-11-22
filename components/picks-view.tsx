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
  /** repo → 站内 slug，用来把精选行链回详情页 */
  projectByRepo: Record<string, string>;
};

export function PicksView({ entries, profile, updatedAt, projectByRepo }: PicksViewProps) {
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
      <div className="sticky top-14 z-30 flex items-center gap-4 border-b border-line bg-bg/90 py-2.5 backdrop-blur">
        <button
          type="button"
          aria-pressed={filter.risingOnly}
          onClick={() => setFilter((current) => ({ ...current, risingOnly: !current.risingOnly }))}
          className={`font-mono text-micro transition-colors duration-150 ${
            filter.risingOnly ? "text-ink" : "text-muted hover:text-ink"
          }`}
        >
          只看涨得快
          <span
            className={`ml-1 tabular-nums ${filter.risingOnly ? "text-accent" : "text-muted/60"}`}
          >
            {risingCount}
          </span>
        </button>

        <p aria-live="polite" className="ml-auto font-mono text-micro text-muted tabular-nums">
          {visible.length} 个
        </p>
      </div>

      <ul>
        {visible.map((entry) => (
          <PickRow
            key={entry.repo}
            entry={entry}
            hot={rising.has(entry.repo)}
            projectSlug={projectByRepo[entry.repo]}
          />
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-10 text-body text-muted">这个筛选下还没有条目。</p>
      ) : null}

      <ShellStrip>
        <ProfileCard profile={profile} updatedAt={updatedAt} variant="strip" />
      </ShellStrip>
    </SiteShell>
  );
}
