# [T-023] 精选详情页：30 个项目全量中文页

- **Status**: Done
- **Depends On**: T-022
- **Target Files**:
  - `content/repos/*.mdx`（30 篇）
  - `lib/repo-detail.ts`、`lib/schema.ts`、`app/picks/[slug]/page.tsx`
  - `.cache/readme/*`（构建期之外的材料，不入库）

## 要解决的问题

精选列表点进去直接跳 GitHub，中文读者要先读英文 README 才知道值不值得看。
列表描述也还是 GitHub 的英文原文。

## 范围

- 做：为每个上榜仓库写一篇站内中文详情页，卡片默认落在详情页；分类由详情页人工标注。
- 不做：自动翻译 README、抓取 README 到仓库、改发现算法（T-022 已做）。

## 验收标准

- [x] 30 篇 `content/repos/<slug>.mdx` 全部通过 schema 校验。
- [x] 每篇固定五节：它是什么 / 怎么上手 / 值得注意的设计 / 边界与风险 / 来源。
- [x] `summary` 是 1–2 句中文，列表卡片不再显示英文描述。
- [x] `categories` 1–4 个，取值来自 `lib/categories.ts`。
- [x] `readmeSha` 与 `.cache/readme/<slug>.json` 一致，来源一节带 GitHub 链接。
- [x] 精选列表每一条都能点到 `/picks/<slug>`，没有「整理中」。
- [x] `node --test`、`tsc --noEmit`、`next build` 全绿；`/picks` 308 → `/`。
