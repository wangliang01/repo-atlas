import { VerdictLegend } from "@/components/verdict-legend";

type HomeRailProps = {
  projects: number;
  picks: number;
  notes: number;
};

/** 首页左栏：结论图例 + 站点数字。数字只放这一处，右栏放的是「这个人是谁」 */
export function HomeRail({ projects, picks, notes }: HomeRailProps) {
  const counts = [
    { label: "项目", value: projects },
    { label: "精选", value: picks },
    { label: "笔记", value: notes },
  ];

  return (
    <div>
      <VerdictLegend />

      <dl className="mt-2 hidden border-t border-line px-3 pb-1 pt-2 text-micro md:block">
        {counts.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between py-1">
            <dt className="text-muted">{item.label}</dt>
            <dd className="tabular-nums text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
