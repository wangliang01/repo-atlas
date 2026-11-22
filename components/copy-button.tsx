"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 剪贴板被拒（非 https 或没权限）就什么都不说，不做假反馈
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-copied={copied ? "true" : "false"}
      className="rounded-[3px] px-2 py-1.5 font-mono text-micro text-muted transition-colors duration-150 hover:bg-line/70 hover:text-ink"
    >
      {copied ? "已复制" : "复制"}
    </button>
  );
}
