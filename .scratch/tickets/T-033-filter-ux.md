# [T-033] 首页筛选：单一高亮 + 切换后滚回列表顶

- **Status**: Done
- **Depends On**: T-031

## 要解决的问题

1. 用途和身份两组分类可以同时高亮，读者以为两层在叠加筛选，想只看其中一层还得手动把另一层点回「全部」。
2. 列表滚到很下面再点分类，新结果在视口外，看起来像「点了没反应」。

## 做法

- `setDomain` / `setIdentity` 互斥：选一个就把另一层重置为「全部」，同一时刻只有一个高亮。
- 切换任何筛选（含「只看涨得快」）后 `window.scrollTo({ top: 0 })`。
  不能用 `scrollIntoView(筛选行)`：筛选行是 sticky，吸顶时它已在视口内，
  scrollIntoView 判定无需滚动而什么都不做（CDP 实测 afterY 不变）。
  列表是首页最顶部的内容，滚到 0 即列表顶。
- 顺带：eslint 忽略 `.scratch/**`（CDP 的 Chrome profile 里有上千个扩展 js，lint 会炸）。

## AC

- [x] 点身份后用途高亮只剩「全部」，反之亦然（CDP 实测 aria-pressed）。
- [x] 滚到 1634px 后点分类，scrollY 回到 0（CDP 实测）。
- [x] 筛选后计数正确（视频与音频 12 个）。
- [x] `node --test` 118/118；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm build` 85 页。

## 进度

- 2026-11-25：完成并验证。
