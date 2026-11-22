import type { Metadata } from "next";
import { NoteCard } from "@/components/note-card";
import { ProfileCard } from "@/components/profile-card";
import { RailList } from "@/components/rail-list";
import { ShellStrip, SiteShell } from "@/components/site-shell";
import { getAllNotes, getSiteCounts, groupNotesByKind } from "@/lib/content";
import { PROFILE } from "@/lib/profile";

export const metadata: Metadata = {
  title: "笔记 | Repo Atlas",
  description: "关于源码、架构与重建的记录，包括还没搞懂的部分。",
};

export default function NotesPage() {
  const notes = getAllNotes();
  const { updatedAt } = getSiteCounts();
  const groups = groupNotesByKind(notes);

  return (
    <div className="wrap py-4 md:py-5">
      <header className="panel flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 py-4">
        <div className="min-w-0">
          <h1 className="text-balance text-display font-semibold tracking-tight text-ink">
            写下来的东西
          </h1>
          <p className="mt-1 text-micro text-muted">
            {notes.length} 篇 · 源码怎么读、架构怎么拆、哪里还没搞懂
          </p>
        </div>
      </header>

      {notes.length === 0 ? (
        <p className="panel mt-4 px-5 py-10 text-small text-muted">还没有笔记。</p>
      ) : (
        <div className="mt-4">
          <SiteShell
            left={
              <RailList
                title="类型"
                // 手机上竖排会把「工具 1」压在正文的「工具」标题上方，同一句话读两遍
                className="max-md:hidden"
                items={groups.map((group) => ({
                  label: group.label,
                  count: group.notes.length,
                  href: `#kind-${group.kind}`,
                }))}
              />
            }
            right={<ProfileCard profile={PROFILE} updatedAt={updatedAt} variant="rail" />}
          >
            {groups.map((group) => (
              <section key={group.kind} id={`kind-${group.kind}`} className="scroll-mt-20">
                <h2 className="border-b border-line px-5 py-3 text-h2 font-semibold text-ink">
                  {group.label}
                </h2>
                <ul>
                  {group.notes.map((note) => (
                    <NoteCard key={note.slug} note={note} />
                  ))}
                </ul>
              </section>
            ))}

            <ShellStrip>
              <ProfileCard profile={PROFILE} updatedAt={updatedAt} variant="strip" />
            </ShellStrip>
          </SiteShell>
        </div>
      )}
    </div>
  );
}
