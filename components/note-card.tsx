import Link from "next/link";
import type { Note } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { NOTE_KIND_LABEL } from "@/lib/labels";
import { readingTimeOf } from "@/lib/mdx";

export function NoteCard({ note }: { note: Note }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={`/notes/${note.slug}`}
        className="block px-5 py-4 transition-colors duration-150 hover:bg-surface-2"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-body font-semibold leading-6 text-ink">{note.data.title}</h2>
          <time
            dateTime={formatDate(note.data.publishedAt).replace(/\./g, "-")}
            className="text-micro text-muted tabular-nums"
          >
            {formatDate(note.data.publishedAt)}
          </time>
        </div>
        <p className="mt-1 line-clamp-2 text-small text-muted">{note.data.summary}</p>
        <p className="mt-2 text-micro text-muted">
          {NOTE_KIND_LABEL[note.data.kind]} · 约 {readingTimeOf(note.body)} 分钟
        </p>
      </Link>
    </li>
  );
}
