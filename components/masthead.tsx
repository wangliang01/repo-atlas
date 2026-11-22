import { formatDate } from "@/lib/date";

type MastheadProps = {
  issue: string;
  updatedAt: Date;
};

/**
 * 掘金没有 hero，标题直接进 feed。这里留一张薄白卡当 masthead：
 * 一行自述句 + 右侧期号与日期，副文案压到 12px，整块从 190px 收到 ~80px。
 */
export function Masthead({ issue, updatedAt }: MastheadProps) {
  return (
    <section data-testid="masthead" className="panel flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 py-4">
      <div className="min-w-0">
        <h1 className="text-balance text-display font-semibold tracking-tight text-ink">
          我跑过的开源项目，和它们的真实成色。
        </h1>
        <p className="mt-1 text-micro text-muted">
          每周 3 个，跑不通的不写。前端出身，正在往全栈和 AI 应用走。
        </p>
      </div>

      <div className="flex shrink-0 items-baseline gap-4 text-micro text-muted">
        <span>本期 · No.{issue}</span>
        <time
          dateTime={formatDate(updatedAt).replace(/\./g, "-")}
          className="tabular-nums"
        >
          {formatDate(updatedAt)}
        </time>
      </div>
    </section>
  );
}
