"use client";

import { useState } from "react";

export type PickView = {
  name: string;
  repo: string;
  category: string;
  tagline: string;
  why: string;
  stars?: number;
  language?: string;
  issue: number;
};

const ALL = "全部";

function formatStars(stars: number): string {
  return stars >= 1000 ? `${Math.round(stars / 1000)}k` : String(stars);
}

export function PickList({ entries, categories }: { entries: PickView[]; categories: string[] }) {
  const [active, setActive] = useState(ALL);
  const visible = active === ALL ? entries : entries.filter((entry) => entry.category === active);
  const tabs = [ALL, ...categories];

  return (
    <div>
      <div
        role="tablist"
        aria-label="按分类筛选"
        className="sticky top-14 z-30 -mx-5 mt-6 flex gap-5 overflow-x-auto border-b border-line bg-bg/85 px-5 py-3 backdrop-blur md:-mx-6 md:px-6"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`shrink-0 font-mono text-micro transition-colors duration-150 ${
              active === tab ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {tab}
            {active === tab ? (
              <span aria-hidden="true" className="ml-1 text-accent">
                ·
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <ul className="mt-2">
        {visible.map((entry) => (
          <li key={`${entry.issue}-${entry.repo}`} className="border-b border-line">
            <a
              href={`https://github.com/${entry.repo}`}
              rel="noopener"
              target="_blank"
              className="flex gap-4 py-5 transition-colors duration-150 hover:bg-surface"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-10 shrink-0 place-items-center border border-line font-serif text-small text-muted"
              >
                {entry.name.slice(0, 1).toUpperCase()}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-serif text-body font-semibold text-ink">{entry.name}</span>
                  <span className="truncate font-mono text-micro text-muted">{entry.repo}</span>
                </span>
                <span className="mt-1 block text-body text-ink">{entry.why}</span>
                <span className="mt-1 block text-small text-muted">{entry.tagline}</span>
              </span>

              <span className="hidden shrink-0 text-right font-mono text-micro text-muted sm:block">
                <span className="block">{entry.category}</span>
                <span className="mt-1 block tabular-nums">
                  {entry.stars ? `★ ${formatStars(entry.stars)}` : `No.${entry.issue}`}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-10 text-body text-muted">这个分类下还没有条目。</p>
      ) : null}
    </div>
  );
}
