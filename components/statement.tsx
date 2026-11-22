import { formatDate } from "@/lib/date";

type StatementProps = {
  issue: string;
  updatedAt: Date;
};

export function Statement({ issue, updatedAt }: StatementProps) {
  return (
    <section data-testid="statement" className="pt-16 md:pt-24">
      <h1 className="max-w-[var(--measure)] text-balance font-serif text-display font-semibold text-ink">
        我跑过的开源项目，和它们的真实成色。
      </h1>
      <p className="mt-4 text-body text-muted">每周 3 个，跑不通的不写。</p>
      <p className="mt-1 text-body text-muted">前端出身，正在往全栈和 AI 应用走。</p>

      <div className="mt-8 border-t border-line" />
      <div className="mt-3 flex items-baseline justify-between font-mono text-micro text-muted">
        <span>本期 · No.{issue}</span>
        <time dateTime={formatDate(updatedAt).replace(/\./g, "-")} className="tabular-nums">
          {formatDate(updatedAt)}
        </time>
      </div>
    </section>
  );
}
