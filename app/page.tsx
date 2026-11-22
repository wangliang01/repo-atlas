import Link from "next/link";
import { AboutSite } from "@/components/about-site";
import { EmptyIssue } from "@/components/empty-issue";
import { IdentityCard } from "@/components/identity-card";
import { ProjectLead } from "@/components/project-lead";
import { RailList } from "@/components/rail-list";
import { RepoRow } from "@/components/repo-row";
import { RisingPanel } from "@/components/rising-panel";
import { SectionHead } from "@/components/section-head";
import { ShellStrip, SiteShell } from "@/components/site-shell";
import { VerdictNote } from "@/components/verdict-note";
import { getAllNotes, getAllProjects, getPicksSnapshot, getSiteCounts } from "@/lib/content";
import { PROFILE } from "@/lib/profile";
import { REPOS } from "@/lib/repos";

export default function Home() {
  const projects = getAllProjects();
  const notes = getAllNotes();
  const counts = getSiteCounts();

  // 首页只放 5 条涨得最快的，完整 26 条在 /picks
  const rising = [...(getPicksSnapshot()?.entries ?? [])]
    .sort((a, b) => b.starsPerDay - a.starsPerDay)
    .slice(0, 5);

  return (
    <div className="wrap py-4 md:py-5">
      <IdentityCard profile={PROFILE} />

      {projects.length === 0 ? (
        <div className="mt-4">
          <EmptyIssue />
        </div>
      ) : (
        <div className="mt-4">
          <SiteShell
            left={
              <RailList
                title="目录"
                items={[
                  { label: "这站", href: "#site" },
                  { label: "评测", href: "#picked", count: projects.length },
                  { label: "轨迹", href: "#repos", count: REPOS.length },
                  { label: "笔记", href: "#notes", count: notes.length },
                ]}
              />
            }
            right={rising.length > 0 ? <RisingPanel entries={rising} total={counts.picks} /> : <div />}
          >
            <section id="site" aria-label="这个站本身" className="scroll-mt-20">
              <SectionHead title="这个站本身" />
              <AboutSite />
            </section>

            <section id="picked" aria-label="我跑过、并给了结论的" className="scroll-mt-20">
              <SectionHead title="我跑过、并给了结论的" />
              <VerdictNote />
              {projects.map((project) => (
                <ProjectLead key={project.slug} project={project} />
              ))}
            </section>

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
              <ul>
                {notes.slice(0, 3).map((note) => (
                  <li key={note.slug} className="border-b border-line last:border-b-0">
                    <Link
                      href={`/notes/${note.slug}`}
                      className="block px-5 py-3 transition-colors duration-150 hover:bg-surface-2"
                    >
                      <span className="block text-body font-medium text-ink">{note.data.title}</span>
                      <span className="mt-0.5 block truncate text-small text-muted">
                        {note.data.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {rising.length > 0 ? (
              <ShellStrip>
                <RisingPanel entries={rising} total={counts.picks} variant="strip" />
              </ShellStrip>
            ) : null}
          </SiteShell>
        </div>
      )}
    </div>
  );
}
