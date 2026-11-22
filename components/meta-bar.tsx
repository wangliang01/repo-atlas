import { DEPLOY_LABEL, MAINTENANCE_LABEL, SETUP_LABEL } from "@/lib/labels";
import { formatStars } from "@/lib/format";
import type { ProjectFrontmatter } from "@/lib/schema";

export function MetaBar({ data }: { data: ProjectFrontmatter }) {
  const items = [
    formatStars(data.stars),
    data.language,
    DEPLOY_LABEL[data.deploy],
    SETUP_LABEL[data.setupTime],
    data.license,
    MAINTENANCE_LABEL[data.maintenance],
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-micro text-muted tabular-nums sm:gap-x-2">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden="true" className="hidden text-line sm:inline">
              ·
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </div>
  );
}
