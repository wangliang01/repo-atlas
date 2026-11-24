"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/notes", label: "笔记" },
];

/** 首页现在同时是精选；详情页也要让「首页」保持高亮 */
function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/picks");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[60px] bg-surface transition-shadow duration-150 ${
        scrolled || menuOpen ? "shadow-[var(--shadow-header)]" : ""
      }`}
    >
      <div className="wrap flex h-[60px] items-center gap-7">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* 2×2 方块 = 索引/地图的意象，比一个纯色方块像标志 */}
          <span aria-hidden className="grid size-[22px] grid-cols-2 gap-[2px]">
            <span className="rounded-[1px] bg-accent" />
            <span className="rounded-[1px] bg-accent/35" />
            <span className="rounded-[1px] bg-accent/35" />
            <span className="rounded-[1px] bg-accent/35" />
          </span>
          <span className="text-body font-semibold tracking-tight text-ink">Repo Atlas</span>
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-6 text-small sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className="text-ink/70 transition-colors duration-150 hover:text-accent-ink aria-[current=page]:font-medium aria-[current=page]:text-accent-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* 搜索面板在 P2 接 Pagefind，这里只留键盘提示，不做假按钮 */}
          <span aria-hidden="true" className="hidden font-mono text-micro text-muted sm:inline">
            ⌘K
          </span>
          <button
            type="button"
            aria-label={menuOpen ? "收起导航菜单" : "展开导航菜单"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-2 flex size-8 items-center justify-center rounded-[4px] text-ink/70 transition-colors duration-150 hover:bg-surface-2 hover:text-ink sm:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            >
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="absolute inset-x-0 top-[60px] border-t border-line bg-surface shadow-[var(--shadow-header)] sm:hidden"
      >
        <nav aria-label="移动端导航" className="wrap flex flex-col py-2 text-small">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-ink/70 transition-colors duration-150 hover:text-accent-ink aria-[current=page]:font-medium aria-[current=page]:text-accent-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
