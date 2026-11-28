# [T-034] 首页展示全部收藏项目，自动化只负责 GitHub 统计

- **Status**: In progress
- **Depends On**: T-033
- **预估轮数**: 4
- **Target Files**:
  - `app/page.tsx`
  - `components/picks-view.tsx`
  - `lib/picks.ts`
  - `lib/content.ts` 或 `lib/repo-detail.ts`
  - `scripts/sync-ai-picks.mjs`
  - 相关测试

## 要解决的问题

当前首页只读 `content/picks/ai.mdx` 的 30 条自动精选。`sync-ai-picks.mjs` 写死 `LIMIT = 30` 并整份覆盖快照，所以人工收录进 `content/repos/` 的 70+ 项目虽然详情页还在，却不会出现在首页列表。2026-11-24 曾达到 73 条，下一次自动同步又被写回 30 条。

用户明确要求：tab 主要展示人工认为还不错的 GitHub 项目（全部收藏），自动化只负责统计 GitHub 上的 star 数；“只看涨得快 10”不能把列表裁成 10 个。

## 范围

- 做：首页 feed 以 `content/repos/` 的全部详情页为全集；GitHub 快照只提供 stars / starsPerDay / avatar / language 等统计字段；“涨得快”改为统计标记或排序提示，不再作为裁剪全集的条件；同步脚本不得把收藏列表裁剪成 30 条。
- 不做：删除/重写已有详情页；改变五问正文结构；新增依赖；动态渲染。

## 验收标准（必须可执行）

1. 构建后首页可见项目数等于 `content/repos/*.mdx` 数量（当前 77），不是 30。
2. 每个首页条目都有站内详情页链接；没有 GitHub 统计快照的项目也出现，star 显示「—」。
3. `只看涨得快` 点击前后，全集数量不变；最多只改变标记/排序，不把列表缩成 10。
4. `pnpm sync:picks --dry-run` 不再输出固定 30 条；自动化只生成统计快照，不决定收藏全集。
5. `pnpm typecheck`、涉及测试、`pnpm build`、`pnpm check:alt` 全绿。

## 低成本验证

- 数 `content/repos/*.mdx` 与首页导出 HTML 中 `/picks/` 链接数。
- 打开一个只在 `content/repos/` 不在当前 30 条快照里的项目详情页和首页行。
- 跑一次 `pnpm sync:picks --dry-run`，确认新逻辑不会把 77 裁成 30。
