import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-24 md:py-32">
      <p className="font-mono text-micro text-muted">404</p>
      <h1 className="mt-3 max-w-[var(--measure)] font-serif text-h1 font-semibold text-ink">
        这条路径没有对应内容。
      </h1>
      <p className="mt-3 text-body text-muted">可能是链接过期了，也可能是这个条目还没写。</p>

      <Link
        href="/"
        className="mt-8 inline-block border border-line px-4 py-2 text-small text-ink transition-colors duration-150 hover:border-ink"
      >
        返回首页
      </Link>

      <div className="mt-12 max-w-[var(--measure)] border-t border-line pt-6">
        <label htmlFor="not-found-search" className="font-mono text-micro text-muted">
          搜索
        </label>
        <input
          id="not-found-search"
          type="search"
          disabled
          placeholder="全文搜索还没接上，先回首页看目录"
          className="mt-2 w-full border border-dashed border-line bg-surface px-3 py-2 text-body text-muted placeholder:text-muted"
        />
      </div>
    </div>
  );
}
