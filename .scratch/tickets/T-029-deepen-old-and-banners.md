# [T-029] 旧 30 篇加深到 1500–2000 字，新 42 篇补 README 配图

- **Status**: Done
- **Depends On**: T-028
- **Target Files**:
  - `content/repos/*.mdx`（T-026 之前的 30 篇）
  - `content/repos/*.mdx`（T-026 新增页面补 `banner`）
  - `lib/repo-detail.test.ts`

## 要解决的问题

1. T-028 只加深了新收录的 42 篇；旧 30 篇正文只有 649–1197 个汉字，放在同一站里深浅不一。
2. 新 42 篇一个 `banner` 都没有；旧 30 篇里有 24 篇按 README 首图配了图。用户要求新页也「有图就补，没有就不补」。

## 范围

- 做：
  - 旧 30 篇正文扩到 1500–2000 汉字，沿用五节结构和「README 称 / 编辑判断 / README 未说明」分层；
  - 新 42 篇里，README 有真实产品截图、demo 或封面图的补 `banner`，只从 README 取，不生成、不替代；
  - 纯徽章、赞助商 logo、应用图标、wordmark、非图片嵌入一律不补；
  - 测试扩展：旧页（`sources: [github]`）汉字数 ≥1500，且所有详情页都必须出现「README」与「编辑判断 / README 未说明」。
- 不做：
  - 不给没有图的 README 编图或放占位图；
  - 不改任何 `readmeSha`、标题、summary、分类字段；
  - 不改页面渲染样式。

## 验收标准

- [x] 30 篇旧页正文汉字数都在 1500–2000 之间。
- [x] 新页 `banner` 全部为 https，全部 HEAD/GET 返回图片；徽章与赞助商图未混入。
- [x] 无图的页面保持无 `banner`，详情页不渲染空位。
- [x] `node --test`、`pnpm typecheck`、`pnpm lint`、`pnpm build` 全过。
