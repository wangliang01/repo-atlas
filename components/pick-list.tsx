"use client";

import Image from "next/image";
import { useState } from "react";
import {
  filterPicks,
  formatPerDay,
  formatShortDate,
  formatStars,
  pickTabs,
  risingRepos,
} from "@/lib/picks";
import type { PickEntry } from "@/lib/schema";

const ALL = "全部";

export function PickList({ entries }: { entries: PickEntry[] }) {
  const [active, setActive] = useState(ALL);
  const tabs = pickTabs(entries);
  const rising = risingRepos(entries);
  const visible = filterPicks(entries, active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="筛选"
        className="sticky top-14 z-30 -mx-5 mt-5 flex gap-5 overflow-x-auto border-y border-line bg-bg/90 px-5 py-2.5 backdrop-blur md:-mx-6 md:px-6"
      >
        {tabs.map((tab) => {
          const on = active === tab.label;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(tab.label)}
              className={`shrink-0 border-b pb-0.5 font-mono text-micro transition-colors duration-150 ${
                on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              <span className={`ml-1 tabular-nums ${on ? "text-accent" : "text-muted/60"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <ul>
        {visible.map((entry) => {
          const hot = rising.has(entry.repo);
          return (
            <li key={entry.repo} className="border-b border-line">
              <a
                href={`https://github.com/${entry.repo}`}
                rel="noopener"
                target="_blank"
                className="group flex gap-3.5 py-3.5 transition-colors duration-150 hover:bg-surface sm:gap-4"
              >
                {entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={`${entry.owner} 的头像`}
                    width={40}
                    height={40}
                    className="mt-0.5 size-10 shrink-0 border border-line object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-10 shrink-0 place-items-center border border-line font-serif text-small text-muted"
                  >
                    {entry.name.slice(0, 1).toUpperCase()}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  {/* 名字不能 shrink-0：system-prompts-and-models-of-ai-tools 这种会顶出视口 14px */}
                  <span className="flex flex-wrap items-baseline gap-x-2.5">
                    <span className="break-words font-serif text-body font-semibold text-ink transition-colors duration-150 group-hover:text-accent">
                      {entry.name}
                    </span>
                    <span className="min-w-0 truncate font-mono text-micro text-muted">
                      {entry.repo}
                    </span>
                  </span>

                  <span className="mt-0.5 line-clamp-2 block text-small text-muted">
                    {entry.description}
                  </span>

                  {entry.why ? (
                    <span className="mt-1.5 block border-l-2 border-accent pl-2 text-small text-ink">
                      {entry.why}
                    </span>
                  ) : null}

                  {/* 375px 一行放不下五项，手机上只留星数、语言、涨速 */}
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-micro text-muted">
                    <span className="tabular-nums sm:hidden">★ {formatStars(entry.stars)}</span>
                    {entry.language ? <span>{entry.language}</span> : null}
                    <span className="hidden tabular-nums sm:inline">
                      ⑂ {formatStars(entry.forks)}
                    </span>
                    <span className="hidden tabular-nums sm:inline">
                      更新 {formatShortDate(entry.pushedAt)}
                    </span>
                    {hot ? (
                      <span className="text-accent tabular-nums">{formatPerDay(entry.starsPerDay)}</span>
                    ) : null}
                    {/* chips 在手机上会再占一整行，宁可砍掉 */}
                    {entry.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="hidden border border-line px-1 leading-relaxed sm:inline"
                      >
                        {topic}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="hidden shrink-0 pl-4 text-right sm:block">
                  <span className="block font-serif text-h2 leading-none tabular-nums text-ink">
                    {formatStars(entry.stars)}
                  </span>
                  <span className="mt-1 block font-mono text-micro text-muted">stars</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-10 text-body text-muted">这个筛选下还没有条目。</p>
      ) : null}
    </div>
  );
}
