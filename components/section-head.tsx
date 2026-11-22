import Link from "next/link";

type SectionHeadProps = {
  title: string;
  action?: { href: string; label: string };
};

/** 区块标题：掘金是把标题放在白卡里当分隔行，不是压在正文上方 */
export function SectionHead({ title, action }: SectionHeadProps) {
  return (
    <div className="flex items-baseline justify-between border-b border-line px-5 py-3">
      <h2 className="text-h2 font-semibold text-ink">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="text-micro text-muted transition-colors duration-150 hover:text-accent-ink"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
