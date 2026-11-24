# [T-022] 精选发现算法：查询矩阵 + 配额选择

- **Status**: Done
- **Depends On**: T-021
- **Target Files**:
  - `lib/queries.ts`、`lib/discovery.ts`
  - `lib/queries.test.ts`、`lib/discovery.test.ts`
  - `.scratch/tickets/T-022-discovery.md`

## 要解决的问题

`scripts/sync-ai-picks.mjs` 的两条查询都按总 stars 排序，最后又从同一批结果里取 top-N，
所以榜单长期是同一批 26 个仓库。新项目只有打赢 AutoGPT / LangChain 的总星数才能进榜。

## 范围

- 做：把查询构造和入选选择抽成纯函数，时间窗口按当天滚动，选择改为分桶配额。
- 不做：接 GitHub API、改同步脚本、改页面（留给 T-024 / T-025 / T-026）。

## 验收标准

- [x] `buildQueries(today)` 返回 9 条 lane，日期窗口按 today 计算，查询长度 < 256。
- [x] lane 覆盖：全时段锚点、7 天 / 30 天新项目、Agent、MCP、LLM、Claude Code、RAG、近期活跃。
- [x] `selectPicks` 结果 ≤ 30，大小写去重，每条只有一个 bucket。
- [x] 每个桶先保底：anchor 8、fresh 10、momentum 8、nominated 4，剩余按 trendScore 补满 30。
- [x] 候选里有 30 天内的新项目时，结果至少包含 1 个 fresh。
- [x] `starsDelta7d` 存在时优先于 `starsPerDay` 计算 trendScore。
- [x] `node --test lib/queries.test.ts lib/discovery.test.ts` 全绿；`pnpm typecheck` 0。
