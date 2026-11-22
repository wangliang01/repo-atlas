# [T-012] 视觉语言换成掘金式信息流：灰底白卡 + 蓝主色 + 无衬线

- **Status**: Done
- **Depends On**: T-011（三栏骨架已经就位）
- **Target Files**:
  - `app/globals.css`（颜色、字号、`.panel`）、`app/layout.tsx`（去掉衬线字体）
  - `components/site-shell.tsx`、`lib/layout.ts`（列宽 180 / 1fr / 260）
  - `components/site-header.tsx`、`site-footer.tsx`、`theme-toggle.tsx`
  - `components/masthead.tsx`（替换 `statement.tsx`）
  - `components/pick-row.tsx`、`project-lead.tsx`、`project-row.tsx`、`note-card.tsx`
  - `components/rail-list.tsx`、`verdict-legend.tsx`、`home-rail.tsx`、`profile-card.tsx`
  - `components/verdict-badge.tsx`、`topic-chip.tsx`、`meta-bar.tsx`、`section-head.tsx`、`prose.tsx`、`toc.tsx`
  - `app/page.tsx`、`app/picks/page.tsx`、`app/notes/page.tsx`、两个详情页、`app/not-found.tsx`

## 要解决的问题

T-011 把结构理顺了，但视觉还是"米色画布 + 衬线大标题 + 1px 细线 + 零圆角"的杂志语言。用户的原话是"做的风格不是我喜欢的风格，我可能更喜欢掘金那一套"。这不是微调能解决的——两套语言从底色、字体、圆角到信息密度全都不一样。

## 范围

- 做：整套 token 换掉；三栏列宽按掘金实测改；列表行重做成"标题 / 两行描述 / meta 一行 + 右侧数字列"；详情页白卡化；暗色跟着换。
- 不做：搜索框、点赞/收藏、评论、作者主页这些社区功能——这是个人名片，不是社区。

## 关键决定

- **先量再仿，不凭印象**。用 CDP 打 juejin.cn，实测出：画布 `#f2f3f5`、卡片纯白 4px 圆角、三栏 180/720/270、列间距 20、行高 99px、标题 16px/24 weight 600 `#252933`、描述 13px、chip 灰底 2px 圆角、主色 `#1e80ff`、header 60px 带 `0 2px 8px` 阴影。整套数值写进 `globals.css` 的注释里，下次不用再量。
- **主色拆成三个 token**，因为一个 `#1e80ff` 过不了 AA：
  - `--accent: #1e80ff` 只做填充和装饰（4px 线、方块标志）；
  - `--accent-ink: #1668c9` 做所有 ≤16px 的蓝字（在卡片上 4.83:1）；
  - `--accent-fill: #1668c9 / #1e6fd0` 做实心按钮和徽章底（白字 7.05 / 4.96:1）。暗色下 accent-ink 是浅蓝，白字压不上去，所以 fill 必须单独一个。
  - `lib/tokens.test.ts` 里带了一个对比度计算器，四组断言：正文 ≥7、次要文字 ≥4.5、蓝字 ≥4.5、白字压 fill ≥4.5；另有一条反过来断言 `#1e80ff` 当文字**达不到** 4.5——哪天它达标了说明 token 被改过，测试会提醒。
- **去掉衬线字体**。整套语言里没有衬线的位置，留着 `Noto_Serif_SC` 只是白下载一份字体。`--font-serif` 从 `@theme inline` 里删掉，`layout.tsx` 少加载一个字体族，Noto Sans SC 补上 600 字重（标题要用）。
- **字号压到掘金刻度**：28 / 24 / 18 / 16 / 13 / 12，仍是六档。`display` 从 40 降到 28 给 masthead 用。
- **masthead 不做 hero**。掘金进来就是列表，所以把原来 190px 的主张区压成一张 92px 的薄卡：一行 28px 自述句 + 一行 12px 承诺句 + 右侧期号日期。
- **行高按内容排，不强行对齐**。掘金 99px 是"1 行标题 + 2 行描述"的算法；我们的行还多一个 meta 行（头像 + 仓库 + 语言 + 标签），实测 104–130px。硬压到 99 只能靠砍字段，不值。

## 验收标准（必须可执行）

- [x] AC-1：`node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error
- [x] AC-2：`pnpm build` 10 页全 `○` / `●`，无 `ƒ`
- [x] AC-3：三栏 1440/1280 → 180 / 672 / 260，1024 → 180 / 776，768 → 180 / 520，375 → 335
- [x] AC-4：3 路由 × 5 档宽度 `scrollWidth - clientWidth === 0`
- [x] AC-5：卡片是纯白 `rgb(255,255,255)`、圆角 4px，画布 `rgb(242,243,245)`
- [x] AC-6：h1 是 28px / 600 / 无衬线；页面里不再出现 `font-serif`
- [x] AC-7：滚 600px 后左右栏 `top === 76`（header 60 + 16）
- [x] AC-8：精选顶部筛选行在滚动前后都不盖住第一行
- [x] AC-9：筛选叠加仍正确：26 → 10 → 6 → 1 → 3，`aria-pressed` 跟随
- [x] AC-10：暗色画布 `rgb(23,24,26)`、卡片 `rgb(35,35,36)`，蓝字可读
- [x] AC-11：`pnpm check:alt` 通过

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：`node --test` 76/76；typecheck 0；lint 0 error
  - AC-2：`○ /` `○ /picks` `○ /notes` `● /notes/[slug]` `● /projects/[slug]`，10 页
  - AC-3：`1440/1280 → 180 / 672 / 260`、`1024 → 180 / 776`、`768 → 180 / 520`、`375 → 335`，3 路由全测
  - AC-4：15 组全 `溢出 0`
  - AC-5：`bodyBg rgb(242,243,245)`、`feedBg rgb(255,255,255)`、`borderTopLeftRadius 4px`
  - AC-6：`h1 {size: 28px, weight: 600, family: Inter}`；`grep -r font-serif app components` 无结果
  - AC-7：`{"railTop":76,"rightTop":76}`
  - AC-8：修前 `barTop 248 / firstLi 234`（筛选行压住第一行），修后 `barTop 188 / firstLi 234`
  - AC-9：`{"all":26,"rising":10,"agentRising":6,"mcpRising":1,"mcpOnly":3,"tabs":0}`
  - AC-10：`{"bg":"rgb(23, 24, 26)","card":"rgb(35, 35, 36)"}`
  - AC-11：`26 张图，全部有 alt 属性；其中 26 张标为装饰（alt=""）`
  - 截图：首页 / 精选 / 笔记 × 1440 / 375 六张，另加详情页与暗色两张，交付前逐张看过
- 实现说明：
  - **feed 面板不能 `overflow-hidden`**：那会让它成为 `position: sticky` 的包含块，精选顶部 `top-[60px]` 的筛选行改成从面板顶算，被推下去 60px 盖住第一行。圆角靠 `border-radius`，不靠裁剪。这条写进了 `lib/layout.test.ts`，只查 `<div data-shell-feed>` 的开标签（注释里提到这个词是允许的）。
  - 右侧数字列原来一行写 `stars`、一行写涨速，两种东西并排会看错，改成统一"数字 + 只有热门条目才有的蓝色涨速"。
  - 行内 `·` 分隔符和词绑在同一个 `span` 里，`whitespace-nowrap`；协议名太长，375 上直接不显示，避免把「·」甩到下一行行首。
  - 手机左栏的结论图例补了一行 12px 说明（`推荐：现在就在用 · 观望：有取舍 · 别碰：踩过坑`），以前只有三个徽章，没人知道在说什么。
  - header 的标志用 2×2 方块（一块实心 + 三块 35% 透明），比一个纯色方块像"索引/地图"。
- 已知取舍：
  - 列表行去掉了 fork 数：一行放不下六个字段，fork 在详情页的 MetaBar 里还有。
  - `最近在扫` 只列名字和两个数字，没有描述——它是导流到 `/picks` 的钩子，不是完整列表。
  - 详情页 h1 用 24px（`--text-h1`），比 masthead 的 28px 小一档：列表页的页标题比条目标题重，是有意的层级。
