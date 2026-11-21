import { EmptyIssue } from "@/components/empty-issue";
import { ProjectCard } from "@/components/project-card";
import { ProjectRow } from "@/components/project-row";
import { SectionHead } from "@/components/section-head";
import { Statement } from "@/components/statement";
import { getAllProjects, getIssueNumber, getLatestUpdate } from "@/lib/content";

export default function Home() {
  const projects = getAllProjects();
  const issue = String(getIssueNumber()).padStart(3, "0");
  const featured = projects.slice(0, 3);
  const latest = projects.slice(0, 8);

  return (
    <div className="wrap">
      <Statement issue={issue} updatedAt={getLatestUpdate()} />

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyIssue />
        </div>
      ) : (
        <>
          <section aria-label="本期" className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </section>

          <section className="mt-16">
            <SectionHead title="最新收录" action={{ href: "/projects", label: "全部" }} />
            <div className="mt-1">
              {latest.map((project) => (
                <ProjectRow key={project.slug} project={project} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
