import { EmptyIssue } from "@/components/empty-issue";
import { Statement } from "@/components/statement";
import { getAllProjects, getIssueNumber, getLatestUpdate } from "@/lib/content";

export default function Home() {
  const projects = getAllProjects();
  const issue = String(getIssueNumber()).padStart(3, "0");

  return (
    <div className="wrap">
      <Statement issue={issue} updatedAt={getLatestUpdate()} />
      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyIssue />
        </div>
      ) : null}
    </div>
  );
}
