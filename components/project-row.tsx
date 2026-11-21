import Link from "next/link";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import type { Project } from "@/lib/content";

export function ProjectRow({ project }: { project: Project }) {
  const { slug, data } = project;

  return (
    <Link
      href={`/projects/${slug}`}
      className="flex h-[72px] items-center gap-4 border-b border-line transition-colors duration-150 hover:bg-surface"
    >
      <span className="flex size-10 shrink-0 items-center justify-center border border-line font-mono text-micro text-muted">
        {data.name.slice(0, 1)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-body text-ink">{data.name}</span>
        <span className="block truncate text-small text-muted">{data.tagline}</span>
      </span>

      <span className="hidden shrink-0 items-center gap-3 font-mono text-micro text-muted tabular-nums sm:flex">
        <span>{data.language}</span>
        <span>{formatStars(data.stars)}</span>
        <span>{formatDate(data.publishedAt)}</span>
      </span>
    </Link>
  );
}
