import Link from "next/link";
import type { Note } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { NOTE_KIND_LABEL } from "@/lib/labels";
import { readingTimeOf } from "@/lib/mdx";

export function NoteCard({ note }: { note: Note }) {
  return (
    <li className="border-b border-line first:border-t">
      <Link
        href={`/notes/${note.slug}`}
        className="block py-6 transition-colors duration-150 hover:bg-surface"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="font-serif text-h2 font-semibold text-ink">{note.data.title}</h2>
          <time
            dateTime={formatDate(note.data.publishedAt).replace(/\./g, "-")}
            className="font-mono text-micro text-muted tabular-nums"
          >
            {formatDate(note.data.publishedAt)}
          </time>
        </div>
        <p className="mt-2 max-w-[var(--measure)] text-body text-muted">{note.data.summary}</p>
        <p className="mt-3 font-mono text-micro text-muted">
          {NOTE_KIND_LABEL[note.data.kind]} · 约 {readingTimeOf(note.body)} 分钟
        </p>
      </Link>
    </li>
  );
}
