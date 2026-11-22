export type RailItem = {
  label: string;
  count?: number;
  href?: string;
  pressed?: boolean;
  onSelect?: () => void;
};

const ITEM =
  "flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-small transition-colors duration-150";

/**
 * 左栏索引。md 以上是竖排列表（选中项浅蓝底 + 蓝字，跟掘金一致），
 * md 以下是同一份 DOM 变横向滚动条——不复制两份，也不做折叠。
 */
export function RailList({
  title,
  items,
  className = "",
}: {
  title: string;
  items: RailItem[];
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <p className="hidden px-3 pb-1 pt-2 text-micro text-muted md:block">{title}</p>
      <ul className="flex gap-1.5 overflow-x-auto p-0 md:mt-0 md:flex-col md:gap-0 md:overflow-visible md:p-0">
        {items.map((item) => {
          const on = item.pressed ?? false;
          const className = `${ITEM} ${
            on
              ? "bg-accent-soft font-medium text-accent-ink"
              : "text-ink/70 hover:bg-surface-2 hover:text-ink"
          }`;
          const count =
            item.count === undefined ? null : (
              <span
                className={`ml-auto shrink-0 text-micro tabular-nums ${
                  on ? "text-accent-ink" : "text-muted"
                }`}
              >
                {item.count}
              </span>
            );

          return (
            <li key={item.label} className="shrink-0 md:shrink">
              {item.onSelect ? (
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={item.onSelect}
                  className={className}
                >
                  <span className="truncate">{item.label}</span>
                  {count}
                </button>
              ) : (
                <a href={item.href} className={className}>
                  <span className="truncate">{item.label}</span>
                  {count}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
