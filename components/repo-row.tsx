import type { Repo } from "@/lib/repos";

/** 「最近在写」的一行。名字 + 仓库自己的描述 + 语言 + 最近推送，整行可点。 */
export function RepoRow({ repo }: { repo: Repo }) {
  return (
    <li className="border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-surface-2">
      <a
        href={repo.url}
        rel="noopener"
        target="_blank"
        className="flex items-baseline gap-3 px-5 py-3"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-medium text-ink">{repo.name}</span>
          <span className="mt-0.5 block truncate text-small text-muted">{repo.desc}</span>
        </span>

        <span className="hidden shrink-0 items-baseline gap-2.5 text-micro text-muted tabular-nums sm:flex">
          <span>{repo.lang}</span>
          <span className="text-line" aria-hidden>
            ·
          </span>
          <span>{repo.updated}</span>
        </span>
      </a>
    </li>
  );
}
