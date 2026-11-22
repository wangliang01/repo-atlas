import Link from "next/link";
import { IdentityCard } from "@/components/identity-card";
import { RailList } from "@/components/rail-list";
import { RepoRow } from "@/components/repo-row";
import { RisingPanel } from "@/components/rising-panel";
import { SectionHead } from "@/components/section-head";
import { ShellStrip, SiteShell } from "@/components/site-shell";
import { getAllNotes, getPicksSnapshot, getSiteCounts } from "@/lib/content";
import { PROFILE } from "@/lib/profile";
import { REPOS } from "@/lib/repos";

export default function Home() {
  const notes = getAllNotes();
  const counts = getSiteCounts();

  // 首页只放 5 条涨得最快的，完整 26 条在 /picks
  const rising = [...(getPicksSnapshot()?.entries ?? [])]
    .sort((a, b) => b.starsPerDay - a.starsPerDay)
    .slice(0, 5);

  return (
    <div className="wrap py-4 md:py-5">
      <IdentityCard profile={PROFILE} />

      <div className="mt-4">
        <SiteShell
          left={
            <RailList
              title="目录"
              items={[
                { label: "轨迹", href: "#repos", count: REPOS.length },
                { label: "精选", href: "/picks", count: counts.picks },
                { label: "笔记", href: "#notes", count: notes.length },
              ]}
            />
          }
          right={rising.length > 0 ? <RisingPanel entries={rising} total={counts.picks} /> : <div />}
        >
          <section id="repos" aria-label="最近在写" className="scroll-mt-20">
            <SectionHead
              title="最近在写"
              action={{ href: "https://github.com/wangliang01", label: "GitHub" }}
            />
            <ul>
              {REPOS.map((repo) => (
                <RepoRow key={repo.name} repo={repo} />
              ))}
            </ul>
          </section>

          <section id="notes" aria-label="笔记" className="scroll-mt-20">
            <SectionHead title="笔记" action={{ href: "/notes", label: "全部" }} />
            {notes.length > 0 ? (
              <ul>
                {notes.slice(0, 3).map((note) => (
                  <li key={note.slug} className="border-b border-line last:border-b-0">
                    <Link
                      href={`/notes/${note.slug}`}
                      className="block px-5 py-3 transition-colors duration-150 hover:bg-surface-2"
                    >
                      <span className="block text-body font-medium text-ink">{note.data.title}</span>
                      <span className="mt-0.5 block line-clamp-2 text-balance text-small text-muted">
                        {note.data.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-small text-muted">第一篇正在写。</p>
            )}
          </section>

          {rising.length > 0 ? (
            <ShellStrip>
              <RisingPanel entries={rising} total={counts.picks} variant="strip" />
            </ShellStrip>
          ) : null}
        </SiteShell>
      </div>
    </div>
  );
}
