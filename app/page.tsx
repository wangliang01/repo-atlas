import { EmptyIssue } from "@/components/empty-issue";
import { HomeRail } from "@/components/home-rail";
import { ProfileCard } from "@/components/profile-card";
import { ProjectLead } from "@/components/project-lead";
import { ProjectRow } from "@/components/project-row";
import { SectionHead } from "@/components/section-head";
import { ShellStrip, SiteShell } from "@/components/site-shell";
import { Statement } from "@/components/statement";
import { getAllProjects, getIssueNumber, getPicksSnapshot, getSiteCounts } from "@/lib/content";
import { formatStars } from "@/lib/format";
import { formatPerDay } from "@/lib/picks";
import { PROFILE } from "@/lib/profile";

export default function Home() {
  const projects = getAllProjects();
  const counts = getSiteCounts();
  const issue = String(getIssueNumber()).padStart(3, "0");

  // 本期和「更早」取不同数据：以前两处都是 slice(0,3)/(0,8)，同一批项目在首页出现两次
  const featured = projects.slice(0, 3);
  const earlier = projects.slice(3);

  const rising = [...(getPicksSnapshot()?.entries ?? [])]
    .sort((a, b) => b.starsPerDay - a.starsPerDay)
    .slice(0, 4);

  return (
    <div className="wrap">
      <Statement issue={issue} updatedAt={counts.updatedAt} />

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyIssue />
        </div>
      ) : (
        <div className="mt-10">
          <SiteShell
            left={<HomeRail projects={counts.projects} picks={counts.picks} notes={counts.notes} />}
            right={<ProfileCard profile={PROFILE} updatedAt={counts.updatedAt} variant="rail" />}
          >
            <section aria-label="本期">
              <div>
                {featured.map((project, index) => (
                  <ProjectLead key={project.slug} project={project} index={index} />
                ))}
              </div>
            </section>

            {earlier.length > 0 ? (
              <section className="mt-14">
                <SectionHead title="更早" />
                <div className="mt-1">
                  {earlier.map((project) => (
                    <ProjectRow key={project.slug} project={project} />
                  ))}
                </div>
              </section>
            ) : null}

            {rising.length > 0 ? (
              <section className="mt-14">
                <SectionHead title="最近在扫" action={{ href: "/picks", label: "全部" }} />
                <ul className="mt-1">
                  {rising.map((entry) => (
                    <li key={entry.repo} className="border-b border-line">
                      <a
                        href={`https://github.com/${entry.repo}`}
                        rel="noopener"
                        target="_blank"
                        className="flex items-baseline justify-between gap-4 py-2.5 transition-colors duration-150 hover:bg-surface"
                      >
                        <span className="min-w-0 truncate text-small text-ink">{entry.name}</span>
                        <span className="shrink-0 font-mono text-micro text-muted tabular-nums">
                          <span className="text-accent">{formatPerDay(entry.starsPerDay)}</span>
                          <span className="ml-2">{formatStars(entry.stars)}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ShellStrip>
              <ProfileCard profile={PROFILE} updatedAt={counts.updatedAt} variant="strip" />
            </ShellStrip>
          </SiteShell>
        </div>
      )}
    </div>
  );
}
