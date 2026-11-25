# [T-027] 修正 Grill Me 的来源仓库

- **Status**: Done
- **Depends On**: T-026
- **Target Files**:
  - `content/repos/mattpocock--skills.mdx`
  - `content/repos/robmitt--grill-me-skill.mdx`（删除）
  - `content/picks/ai.mdx`、`content/picks/history.json`
  - `public/avatars/mattpocock.png`、`public/avatars/RobMitt.png`（删除）

## 要解决的问题

T-026 把用户说的 Grill Me 落到了 `RobMitt/grill-me-skill`，但用户指的是 `mattpocock/skills` 仓库里的 `/grill-me`。两者不是同一个 Skill，来源、设计和使用方式都不同。

## 范围

- 做：
  - 新增 `mattpocock/skills` 详情页，重点写清 `/grill-me` 与 `grilling`、`grill-with-docs` 的关系；
  - 首页对应条目从 `RobMitt/grill-me-skill` 换成 `mattpocock/skills`；
  - 台账删除旧键、写入新键；
  - 删除旧详情页和旧头像。
- 不做：同时保留两个 Grill Me 条目，或把 `RobMitt` 的内容拼进新页面。

## 验收标准

- [x] `content/repos/robmitt--grill-me-skill.mdx` 不存在，`mattpocock--skills.mdx` 通过 schema。
- [x] 首页无 `RobMitt/grill-me-skill`，有 `mattpocock/skills`，且按 `trendScore` 排序。
- [x] `history.json` 无旧键，有新键。
- [x] `node --test`、`pnpm typecheck`、`pnpm lint`、`pnpm build` 全过。
