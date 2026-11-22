import { VerdictBadge } from "@/components/verdict-badge";
import { VERDICT_HINT, VERDICT_LABEL, VERDICT_NOTE } from "@/lib/labels";
import type { ProjectFrontmatter } from "@/lib/schema";

const ORDER: ProjectFrontmatter["verdict"][] = ["recommend", "watch", "avoid"];

/** 首页左栏的图例：三个标签以前只出现在卡片上，没有任何解释 */
export function VerdictLegend() {
  return (
    <nav aria-label="结论怎么读">
      <p className="font-mono text-micro text-muted">结论怎么读</p>
      <ul className="mt-2 flex gap-4 overflow-x-auto pb-1 md:mt-3 md:flex-col md:gap-3 md:overflow-visible md:pb-0">
        {ORDER.map((verdict) => (
          <li key={verdict} className="shrink-0 md:shrink">
            <VerdictBadge verdict={verdict} />
            <span className="mt-1 hidden text-small text-muted md:block">{VERDICT_NOTE[verdict]}</span>
          </li>
        ))}
      </ul>
      {/* 手机上只有三个标签，光看「观望」不知道在观望什么 */}
      <p className="mt-2 text-small text-muted md:hidden">
        {ORDER.map((verdict) => `${VERDICT_LABEL[verdict]}：${VERDICT_HINT[verdict]}`).join(" · ")}
      </p>
    </nav>
  );
}
