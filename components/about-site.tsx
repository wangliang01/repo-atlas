/**
 * 「这个站本身」。没有作品集的时候，一个能按 F12 看的站就是最硬的证据——
 * 所以这块不写形容词，只写能当场验证的东西：几页、几个测试、内容怎么校验。
 */
const FACTS = [
  { value: "10", label: "静态页面" },
  { value: "76", label: "单元测试" },
  { value: "26", label: "实测项目" },
  { value: "190", label: "公开仓库" },
];

export function AboutSite() {
  return (
    <div className="px-5 py-5">
      <p className="text-small text-muted">
        架构、内容口径、验收标准是我定的；代码跟 AI 结对写，每一处改动都有测试和决策记录兜底。
        全站构建期静态生成，内容用 Zod 校验——字段缺一个，构建直接失败。
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FACTS.map((fact) => (
          <div key={fact.label} className="rounded-[4px] bg-surface-2 px-3 py-2.5">
            <dt className="text-micro text-muted">{fact.label}</dt>
            <dd className="mt-0.5 text-h2 font-semibold tabular-nums text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-micro text-muted">
        Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · MDX · 零动态渲染
      </p>
    </div>
  );
}
