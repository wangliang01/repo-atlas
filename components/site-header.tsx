"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/projects", label: "雷达" },
  { href: "/picks", label: "精选" },
  { href: "/notes", label: "笔记" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-14 border-b bg-bg transition-colors duration-150 ${
        scrolled || menuOpen ? "border-line bg-bg/80 backdrop-blur" : "border-transparent"
      }`}
    >
      <div className="wrap flex h-14 items-center gap-6">
        <Link href="/" className="font-serif text-body font-semibold text-ink">
          Repo Atlas
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-5 text-small sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
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
            className="flex size-8 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-line hover:text-ink sm:hidden"
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
        className="absolute inset-x-0 top-14 border-b border-line bg-bg sm:hidden"
      >
        <nav aria-label="移动端导航" className="wrap flex flex-col py-2 text-small">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-muted transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
