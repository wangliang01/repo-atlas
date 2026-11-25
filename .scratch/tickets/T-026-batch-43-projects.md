# [T-026] 收录 43 个新项目：去重、中文详情页、首页上榜

- **Status**: Done
- **Depends On**: T-025
- **Target Files**:
  - `content/repos/*.mdx`（新增 43 篇）
  - `content/picks/ai.mdx`、`content/picks/history.json`
  - `public/avatars/*.png`
  - `PROGRESS.md`

## 要解决的问题

用户从头条收藏里新整理了 46 个项目名，要求先按仓库去重，再读 README、翻成中文，加入首页和站内详情页。现有 30 个项目里已有 `JuliusBrussee/caveman` 与 `heygen-com/hyperframes`，其余需要逐一落到准确的 GitHub 仓库。

## 范围

- 做：
  - 46 个名字去重；跳过 `caveman`、`hyperframes`；
  - 把拼写/指代不准的名字落到实际仓库：`GASP Skill` → `greensock/gsap-skills`，`modren-web-guidance` → `GoogleChrome/modern-web-guidance`，`Skill Creator` → `anthropics/skills` 的 `skills/skill-creator`；
  - 43 个新项目各建一篇 `content/repos/<owner>--<repo>.mdx`，固定五节，README 主张与编辑判断分开写；
  - 首页快照新增 43 条，`discoveredVia: ["toutiao"]`、`bucket: nominated`、`firstSeen: 2026-11-25`；
  - `history.json` 补齐首次上榜台账；
  - 下载缺失头像。
- 不做：自动分类、给没有 README 的项目编内容、把第三方在线服务写进官方能力。

## 验收标准

- [x] 46 个名字全部有去重/落库结论，43 个新仓库有详情页。
- [x] 每篇 frontmatter 通过 schema：`domains` 1–3 个、`forms` 1–2 个、`readmeSha` 与 `.cache/readme` 一致。
- [x] 首页 73 条，按 `trendScore` 倒序，无重复仓库；43 条新条目都有 `firstSeen` 和台账记录。
- [x] 所有详情页都有五节：它是什么 / 怎么上手 / 值得注意的设计 / 边界与风险 / 来源。
- [x] `node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm build` 静态导出通过。
