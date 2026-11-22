import type { Metadata } from "next";
import { ProjectRow } from "@/components/project-row";
import { getAllProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "雷达 | Repo Atlas",
  description: "收录的开源项目，按最近核实时间倒序。",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="wrap py-10 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="font-mono text-micro text-muted">雷达</p>
        <h1 className="mt-2 font-serif text-h1 font-semibold text-ink">收录的项目</h1>
        <p className="mt-2 text-body text-muted">
          {projects.length} 个 · 按最近核实时间倒序，每个都写过判断
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="mt-10 text-body text-muted">还没有收录。</p>
      ) : (
        <div className="mt-2">
          {projects.map((project) => (
            <ProjectRow key={project.slug} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
