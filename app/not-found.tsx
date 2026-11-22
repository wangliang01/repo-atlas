import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-4 md:py-5">
      <div className="panel px-6 py-16 md:py-24">
        <p className="text-micro text-muted">404</p>
        <h1 className="mt-2 max-w-[var(--measure)] text-h1 font-semibold text-ink">
          这条路径没有对应内容。
        </h1>
        <p className="mt-2 text-small text-muted">可能是链接过期了，也可能是这个条目还没写。</p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-[4px] bg-accent-fill px-4 py-2 text-small text-white transition-opacity duration-150 hover:opacity-90"
        >
          返回首页
        </Link>

        <div className="mt-10 max-w-[var(--measure)] border-t border-line pt-5">
          <label htmlFor="not-found-search" className="text-micro text-muted">
            搜索
          </label>
          <input
            id="not-found-search"
            type="search"
            disabled
            placeholder="全文搜索还没接上，先回首页看目录"
            className="mt-2 w-full rounded-[4px] border border-dashed border-line bg-surface-2 px-3 py-2 text-small text-muted placeholder:text-muted"
          />
        </div>
      </div>
    </div>
  );
}
