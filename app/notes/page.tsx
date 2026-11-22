import type { Metadata } from "next";
import { NoteCard } from "@/components/note-card";
import { getAllNotes } from "@/lib/content";

export const metadata: Metadata = {
  title: "笔记 | Repo Atlas",
  description: "关于源码、架构与重建的记录，包括还没搞懂的部分。",
};

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <div className="wrap py-10 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="font-mono text-micro text-muted">笔记</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">写下来的东西</h1>
        <p className="mt-2 text-body text-muted">
          {notes.length} 篇 · 源码怎么读、架构怎么拆、哪里还没搞懂
        </p>
      </header>

      {notes.length === 0 ? (
        <p className="mt-10 text-body text-muted">还没有笔记。</p>
      ) : (
        <ul className="mt-2">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </ul>
      )}
    </div>
  );
}
