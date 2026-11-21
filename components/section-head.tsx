import Link from "next/link";

type SectionHeadProps = {
  title: string;
  action?: { href: string; label: string };
};

export function SectionHead({ title, action }: SectionHeadProps) {
  return (
    <div className="flex items-baseline justify-between border-t border-line pt-3">
      <h2 className="text-h2 font-serif font-semibold text-ink">{title}</h2>
      {action ? (
        <Link
          href={action.href}
          className="font-mono text-micro text-muted transition-colors duration-150 hover:text-accent"
        >
          {action.label} →
        </Link>
      ) : null}
    </div>
  );
}
