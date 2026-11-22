export type RailItem = {
  label: string;
  count?: number;
  href?: string;
  pressed?: boolean;
  onSelect?: () => void;
};

const ITEM =
  "-ml-px block whitespace-nowrap border-b pb-0.5 text-left font-mono text-micro transition-colors duration-150 md:border-b-0 md:border-l md:py-1 md:pb-0 md:pl-3";

/**
 * 左栏索引。md 以上是竖排列表（带左边线，当前项 accent），
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
      <p className="hidden font-mono text-micro text-muted md:block">{title}</p>
      <ul className="flex gap-5 overflow-x-auto pb-1 md:mt-3 md:flex-col md:gap-0 md:overflow-visible md:pb-0">
        {items.map((item) => {
          const on = item.pressed ?? false;
          const className = `${ITEM} ${on ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`;
          const count =
            item.count === undefined ? null : (
              <span className={`ml-1 tabular-nums ${on ? "text-accent" : "text-muted/60"}`}>
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
                  {item.label}
                  {count}
                </button>
              ) : (
                <a href={item.href} className={className}>
                  {item.label}
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
