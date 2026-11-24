# [T-024] 首页减负 + 代码块改深色

- **Status**: Done
- **Depends On**: T-023
- **Target Files**:
  - `app/page.tsx`、`components/picks-view.tsx`、`components/site-shell.tsx`
  - `components/code-block.tsx`、`components/copy-button.tsx`、`lib/highlight.ts`
  - `lib/home.test.ts`、`lib/components.test.ts`、`lib/picks.test.ts`

## 要解决的问题

首页首屏先出现身份卡和口号，真正的精选被推到第二屏；底部又挂着「最近在写」和笔记，
与导航里的「笔记」重复。详情页代码块在浅色页面里是一块浅灰底，评论区也偏灰，读起来费劲。

## 范围

- 做：首页只保留精选 feed；删掉身份卡、可见口号、最近在写、笔记区块与右栏个人卡。
- 做：代码块统一深色（GitHub Dark），补语言/复制头部；详情页与笔记共用同一套高亮预处理。
- 做：详情页整体对齐掘金文章页：左「文章卡」（标题 → meta 行 → banner → 正文），右「三张独立卡」——项目信息卡（头像 + 结论徽章 + Stars/语言/收录 三格 + 许可证 + GitHub 按钮 + README sha）、目录卡、相关推荐卡（同分类星数最高的 4 个）。
- 做：详情页加 banner（参考掘金封面位）：从 README 首图人工挑选非徽章图，写进 frontmatter `banner`；README 没有合适图就不显示（30 个里 24 个有）。
- 不做：改精选发现逻辑、改详情页五节结构、动站点导航。

## 验收标准

- [x] 首页首屏直接是分类 + 精选列表，没有身份卡、slogan 区块、右栏个人卡。
- [x] 首页不再渲染「最近在写」与笔记区块，笔记只从顶部导航进入。
- [x] 无右栏时 grid 真的少一列，feed 不被 260px 空白挤窄。
- [x] 代码块常驻 `#0d1117`，浅色/暗色页面观感一致；注释对比度 ≥ 4.5:1。
- [x] 详情页代码块走 `preprocessCode`，带语言标签、复制按钮和语法高亮。
- [x] 详情页是掘金式两栏：左文章卡 + 右三张卡（项目信息 / 目录 / 相关推荐），右栏 sticky，移动端右栏隐藏。
- [x] 24 篇详情页有 banner（README 首图，非徽章/非 logo），URL 全部 HEAD 200；其余 6 篇 README 无合适图，不渲染。
- [x] `node --test` 108/108；`tsc --noEmit` 0；`next build` 成功；`/picks` 308。
