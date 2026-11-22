import { VerdictBadge } from "@/components/verdict-badge";
import { VERDICT_HINT, VERDICT_LABEL, VERDICT_NOTE } from "@/lib/labels";
import type { ProjectFrontmatter } from "@/lib/schema";

const ORDER: ProjectFrontmatter["verdict"][] = ["recommend", "watch", "avoid"];

/** 首页左栏的图例：三个标签以前只出现在卡片上，没有任何解释 */
export function VerdictLegend() {
  return (
    <nav aria-label="结论怎么读">
      <p className="hidden px-3 pb-1 pt-2 text-micro text-muted md:block">结论怎么读</p>
      <ul className="flex gap-1.5 overflow-x-auto p-0 md:flex-col md:gap-0.5 md:overflow-visible md:p-0">
        {ORDER.map((verdict) => (
          <li key={verdict} className="shrink-0 md:shrink">
            <div className="rounded-[4px] px-3 py-1.5">
              <VerdictBadge verdict={verdict} />
              <span className="mt-1 hidden text-micro leading-snug text-muted md:block">
                {VERDICT_NOTE[verdict]}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {/* 手机上只有三个标签，光看「观望」不知道在观望什么 */}
      <p className="px-3 pt-1 text-micro text-muted md:hidden">
        {ORDER.map((verdict) => `${VERDICT_LABEL[verdict]}：${VERDICT_HINT[verdict]}`).join(" · ")}
      </p>
    </nav>
  );
}
