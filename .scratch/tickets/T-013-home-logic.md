# [T-013] 首页换前提：从「作品集」改成「证据页」

- **Status**: Done
- **Depends On**: T-012（掘金式视觉语言已就位）
- **Target Files**:
  - `app/page.tsx`（整页重组）
  - `components/identity-card.tsx`、`about-site.tsx`、`verdict-note.tsx`、`repo-row.tsx`、`rising-panel.tsx`（新建）
  - `components/project-lead.tsx`、`profile-card.tsx`（改）
  - `lib/profile.ts`、`lib/repos.ts`（新建）、`public/avatar.jpg`（新增）
  - 删除（本单）：`components/home-rail.tsx`、`masthead.tsx`、`verdict-legend.tsx`
  - 已在 T-011 / T-012 删除、本单不再引用：`statement.tsx`、`project-card.tsx`、`pick-list.tsx`、`app/projects/page.tsx`
  - 测试：`lib/home.test.ts`、`lib/repos.test.ts`（新）、`lib/profile.test.ts`、`lib/components.test.ts`、`lib/layout.test.ts`、`lib/tokens.test.ts`

## 要解决的问题

用户对 T-012 的首页下的判断是「做得一点也不好看……现在设计的内容我是一点也不喜欢，看到就想划走」，并且明确说「不只是 UI，整个首页」。

问题不在样式，在**前提**：首页原先把 Cal.com / Uptime Kuma / n8n 摆在最前面，当成「我的作品」。这三条是别人的仓库，访客看到的是三个如雷贯耳的名字，然后就没有然后了——他不知道这跟屏幕前这个人有什么关系，所以划走。

用户自己给了答案：「我现在也没有什么拿得出手的作品啊。」

## 范围

- 做：把首页第一屏从「列表」改成「一张身份卡」；把「作品」改成「证据」；新增「最近在写」把 8 个真实公开仓库列出来；重写左栏目录与右栏。
- 不做：不做同步 190 个仓库的脚本（多数是练习和 fork，是噪音）；不手写 6 篇深度长文（内容用户提供不了）；不做「关于我」时间线。

## 关键决定

- **先查真实的 GitHub，再决定首页写什么**。拉 `api.github.com/users/wangliang01`：190 个公开仓库、75 个 fork、3 个 follower，bio / location / blog 全空。结论是「确实没有传统作品集」，所以不编，改成**证据页**：这个站本身就是作品，26 条评测就是判断力，8 个仓库就是轨迹。
- **第一屏是身份卡，不是信息流**。访客三秒内只需要知道四件事：这是谁、在找什么、在哪、去哪看代码。所以卡片里只有名字、一句定位、城市、GitHub。**「求职中」做成唯一一块实心蓝徽章**——这是整站的目的，不能跟城市一样混在 12px 灰字里。
- **四块内容各有各的职责，不重复**：
  1. `这个站本身` —— 把站点当作品，只写当场能验证的数字（静态页面 10 / 单元测试 76 / 实测项目 26 / 公开仓库 190），加一句「架构、内容口径、验收标准是我定的；代码跟 AI 结对写」。这是全站唯一敢下判断的地方，因为每条都能点开核对。
  2. `我跑过、并给了结论的` —— 3 条评测，结论徽章 + 上手成本 + 语言 + 协议 + 星数。图例（推荐 / 观望 / 别碰）挪到标题下面一行，不再挤在 180px 左栏里换行。
  3. `最近在写` —— 8 个真实仓库，描述**逐字抄 GitHub**，不润色。用户要的是「他真的在写东西」，不是「他把自己夸了一遍」。
  4. `笔记` —— 已有的文章，最多 3 条。
- **右栏只放「最近在扫」**，5 条 + 「共 26 个 · 每周同步」，是导流到 `/picks` 的钩子，不是第二份列表。首页不再放个人卡——身份卡已经承担了这件事。
- **两处文案的坑都写进测试**：
  - 身份卡在 375px 下头像与文字**必须上下堆叠**。并排时头像吃掉 72px，文字只剩 223px，「前端出身，在补 Node 和 AI 应用」会掉出一个孤零零的「用」。`lib/home.test.ts` 只匹配容器开标签里的 `flex-col` / `sm:flex-row`。
  - 右栏个人卡（`/picks`、`/notes`）的定位句**必须独占整行**。挤在 48px 头像右边只剩 168px，同样掉孤字。改成整行 13px 后一行放得下。

## 验收标准（必须可执行）

- [x] AC-1：`node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error
- [x] AC-2：`pnpm build` 10 页全 `○` / `●`，无 `ƒ`
- [x] AC-3：3 路由 × 5 档宽度 `scrollWidth - clientWidth === 0`
- [x] AC-4：第一屏是身份卡，`top 80`，含真名 / 定位句 / 城市 / 求职中徽章 / GitHub 链接 / 技术栈
- [x] AC-5：`求职中` 徽章底色 `rgb(22,104,201)`、白字
- [x] AC-6：`这个站本身` 四个数字都在（10 / 76 / 26 / 190），且 76 与 `node --test` 实际条数一致
- [x] AC-7：首页 4 个区块按 `#site` → `#picked` → `#repos` → `#notes` 顺序渲染，左栏 4 个锚点全部命中
- [x] AC-8：`最近在写` 8 行，链接全部指向 `github.com/wangliang01/<name>`
- [x] AC-9：375px 下定位句单行（高度 28px），身份卡不溢出
- [x] AC-10：滚 700px 后左右栏 `top === 76`
- [x] AC-11：暗色画布 `rgb(23,24,26)`、卡片 `rgb(35,35,36)`
- [x] AC-12：`pnpm check:alt` 通过
- [x] AC-13：旧组件已删除，`/projects` 仍 308 到 `/`
## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：`node --test` 80/80；`tsc --noEmit` 0；`eslint` 0 error（5 条 warning 全在 `.audit/` 临时探针脚本里）
  - AC-2：`○ /` `○ /picks` `○ /notes` `● /notes/[slug]` `● /projects/[slug]`，10 页
  - AC-3：`/@1440=0 /picks@1440=0 /notes@1440=0 … /@375=0 /picks@375=0 /notes@375=0`，15 组全 0
  - AC-4：`{"identity":{"top":80,"h":140}}`；技术栈 6 枚 chip
  - AC-5：`{"badge":"求职中 bg=rgb(22, 104, 201) color=rgb(255, 255, 255)"}`
  - AC-6：页面渲染 `静态页面 10 / 单元测试 76 / 实测项目 26 / 公开仓库 190`，其中 76 与测试条数一致
  - AC-7：`sections site:247 picked:392 repos:657 notes:127`；左栏 `["这站","评测3","轨迹8","笔记1"]`，锚点 `#site #picked #repos #notes`
  - AC-8：`#repos li` 8 条；`lib/repos.test.ts` 断言每条 `href` 与 `name` 一致、按更新时间倒序
  - AC-9：`{"cardH":266,"taglineH":28,"taglineW":234}`（28px = 单行）
  - AC-10：`afterScroll {"left":76,"right":76,"y":700}`
  - AC-11：`{"body":"rgb(23, 24, 26)","panel":"rgb(35, 35, 36)"}`
  - AC-12：`31 张图，全部有 alt 属性；其中 26 张标为装饰（alt=""）`
  - AC-13：`grep -rn "statement\|masthead\|home-rail\|verdict-legend\|project-card\|pick-list" app components lib` 只剩测试里断言「这些文件不该存在」的语句，组件目录里已无引用；`/projects` 308 → `/`
  - 其他：`{"cols":[180,672,260]}`、`h1 28px/600/Inter`、`pageH 1785`、右栏 5 条
  - 截图：首页 / 精选 / 笔记 × 1440 / 375 六张整页 + 右栏个人卡放大一张，交付前逐张看过
- 实现说明：
  - 身份卡在手机上是 `flex-col`、`sm:flex-row`。桌面端头像 80px、手机 56px，技术栈在 `sm` 以上右对齐并垂直居中——不然 1148px 宽的卡右边三分之一是空的。
  - `about-site.tsx` 不再自带 `<h2>`：`SectionHead` 已经渲染了「这个站本身」，重复过一次标题。
  - 左栏「目录」的计数来自 `getSiteCounts()` / `REPOS.length` / `notes.length`，不是手写。
  - `RepoRow` 整行可点，右侧语言与更新时间在 375px 下隐藏——放不下，且手机上日期不是第一优先级。
  - 头像用的是 GitHub 公开头像（`public/avatar.jpg`，200×200），`alt` 写成「王亮的头像」。
- 已知取舍：
  - `lib/repos.ts` 是手挑的 8 个，不是同步脚本拉全量。190 个仓库里多数是练习和 fork，列出来反而稀释信号。
  - 笔记只有 1 篇，所以 `笔记` 区块下方会留一段空白（面板被右栏高度撑开）。等笔记攒到 3 篇自然消失。
  - `/picks` 左栏分类计数是「按标签」，同一条会落进多个分类，加起来 45 大于总数 28。不是 bug，但第一次看会疑惑，下次做分类页时改文案说明。
  - 头像是一张戴帽子的照片，用在求职站上偏随意；用户换图只需替换 `public/avatar.jpg`，代码不用动。
