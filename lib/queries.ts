/**
 * 精选的 GitHub 查询矩阵。
 *
 * 旧实现只有「topic:ai 全时段高星」和「近半年创建后仍按总星排序」两条，
 * 新仓库永远排不进 top-N。这里改成按时间窗口滚动的多条 lane：每条 query
 * 只和同窗口的项目竞争，榜单才会随日期变化。
 */
export type PickQuery = {
  id: string;
  q: string;
  sort: "stars" | "updated";
  /** 创建/推送时间窗口，0 表示不看时间 */
  windowDays: number;
};

const DAY_MS = 86_400_000;

/** 按本地时区往前推 n 天，返回 GitHub 搜索认识的 YYYY-MM-DD */
export function isoDaysBefore(today: Date, days: number): string {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function buildQueries(today: Date): PickQuery[] {
  const d7 = isoDaysBefore(today, 7);
  const d30 = isoDaysBefore(today, 30);
  const d60 = isoDaysBefore(today, 60);
  const d90 = isoDaysBefore(today, 90);

  return [
    // 锚点：保留经得起时间检验的项目，不让榜单完全变成新仓库列表
    { id: "anchor", q: "topic:ai stars:>8000", sort: "stars", windowDays: 0 },
    // 一周内新建：几十颗星就能进前 30，是「新面孔」的主要来源
    { id: "fresh-7d", q: `topic:ai created:>${d7} stars:>10`, sort: "stars", windowDays: 7 },
    { id: "fresh-30d", q: `topic:ai created:>${d30} stars:>50`, sort: "stars", windowDays: 30 },
    // 没打 topic:ai 的方向词也查，否则 MCP / Agent 项目根本进不了候选
    { id: "agent", q: `topic:agent created:>${d30} stars:>50`, sort: "stars", windowDays: 30 },
    { id: "mcp", q: `mcp in:name,description created:>${d60} stars:>50`, sort: "stars", windowDays: 60 },
    { id: "llm", q: `llm in:name,description created:>${d60} stars:>100`, sort: "stars", windowDays: 60 },
    { id: "claude-code", q: `topic:claude-code created:>${d90} stars:>50`, sort: "stars", windowDays: 90 },
    { id: "rag", q: `topic:rag created:>${d90} stars:>100`, sort: "stars", windowDays: 90 },
    // 老项目重新活跃时也值得看，补足「新项目」之外的一条线
    { id: "active", q: `topic:ai pushed:>${d7} stars:>1000`, sort: "updated", windowDays: 7 },
  ];
}

export function searchUrl(query: PickQuery, perPage = 30): string {
  const params = new URLSearchParams({
    q: query.q,
    sort: query.sort,
    order: "desc",
    per_page: String(perPage),
  });
  return `https://api.github.com/search/repositories?${params.toString()}`;
}

/** 测试和调用方都靠它判断「是否在最近 N 天内」 */
export function isWithinDays(createdAt: Date, today: Date, days: number): boolean {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const created = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate());
  return start.getTime() - created.getTime() < days * DAY_MS;
}
