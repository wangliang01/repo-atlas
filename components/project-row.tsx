import Link from "next/link";
import { formatDate } from "@/lib/date";
import { formatStars } from "@/lib/format";
import type { Project } from "@/lib/content";

export function ProjectRow({ project }: { project: Project }) {
  const { slug, data } = project;

  return (
    <Link
      href={`/projects/${slug}`}
      className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-surface-2"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-semibold leading-6 text-ink">
          {data.name}
        </span>
        <span className="block truncate text-small text-muted">{data.tagline}</span>
      </span>

      <span className="hidden shrink-0 items-center gap-3 text-micro text-muted tabular-nums sm:flex">
        <span>{data.language}</span>
        <span>{formatStars(data.stars)}</span>
        <span>{formatDate(data.publishedAt)}</span>
      </span>
    </Link>
  );
}
