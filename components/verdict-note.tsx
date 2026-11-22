import { VERDICT_HINT, VERDICT_LABEL } from "@/lib/labels";
import type { ProjectFrontmatter } from "@/lib/schema";

const ORDER: ProjectFrontmatter["verdict"][] = ["recommend", "watch", "avoid"];

/**
 * 结论图例。以前是左栏竖排三块（180px 里每块说明折两行），
 * 现在压成一行放在「评测」标题下面——解释要挨着被解释的东西。
 */
export function VerdictNote() {
  return (
    <p className="px-5 pb-3 text-micro text-muted">
      {ORDER.map((verdict) => `${VERDICT_LABEL[verdict]}：${VERDICT_HINT[verdict]}`).join("　·　")}
    </p>
  );
}
