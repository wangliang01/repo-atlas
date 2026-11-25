# [T-025] 分类拆成领域 / 形态 / 对标三层

- **Status**: Done
- **Depends On**: T-024
- **Target Files**:
  - `lib/categories.ts`、`lib/schema.ts`、`lib/picks.ts`、`lib/repo-detail.ts`
  - `app/picks/[slug]/page.tsx`、`components/picks-view.tsx`、`components/pick-row.tsx`、`components/pick-aside.tsx`
  - `content/repos/*.mdx`（30 篇）
  - `lib/picks.test.ts`、`lib/repo-detail.test.ts`

## 要解决的问题

`categories` 把三种东西混在一个轴里：用途（写作 / 视频）、形态（Agent 框架 / 记忆）、关注点（架构 / 测试）。结果 `Agent 框架` 变成万能筐，t3code 这类控制面被误标成框架。

## 范围

- 做：
  - `domains`：主领域 1–3 个，决定左栏和筛选；
  - `forms`：形态标签 1–2 个，不占主分类；
  - `peers`：同层对标，t3code → Orca；
  - 30 篇详情页按 README 内容重新标注；
  - 首页左栏改叫「领域」，精选行同时显示领域与形态。
- 不做：自动分类、按形态筛选、把 Orca 补成站内项目。

## 验收标准

- [x] 30 篇 `content/repos/*.mdx` 全部通过 schema：`domains` 1–3 个、`forms` 1–2 个。
- [x] t3code：`domains: ["编码与开发"]`、`forms: ["Agent 控制面 / 编排", "桌面 / Web 应用"]`、`peers: ["Orca"]`。
- [x] 首页左栏只显示领域；形态作为精选行和详情页右栏的标签。
- [x] `node --test` 109/109；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm build` 41 页静态导出。
