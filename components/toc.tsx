"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/mdx";

export function Toc({ items }: { items: Heading[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="本页目录" className="sticky top-20">
      <p className="text-micro text-muted">本页</p>
      <ul className="mt-3 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? "location" : undefined}
              className={[
                "-ml-px block border-l py-1 pr-2 text-small transition-colors duration-150",
                item.depth === 3 ? "pl-6" : "pl-3",
                item.id === activeId
                  ? "border-accent-ink font-medium text-accent-ink"
                  : "border-transparent text-muted hover:text-ink",
              ].join(" ")}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
