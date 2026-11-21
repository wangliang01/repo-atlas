"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/components/theme-script";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  // 初始值由首屏脚本写进 <html>，这里只做回读，避免 SSR 与客户端不一致
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    root.style.colorScheme = next ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      aria-pressed={dark}
      className="flex size-8 items-center justify-center rounded-[4px] text-muted transition-colors duration-150 hover:bg-line hover:text-ink"
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
        {dark ? (
          <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z" />
        ) : (
          <>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1 1M11.9 11.9l1 1M12.9 3.1l-1 1M4.1 11.9l-1 1" />
          </>
        )}
      </svg>
    </button>
  );
}
