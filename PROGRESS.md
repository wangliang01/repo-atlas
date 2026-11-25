# 进度看板

> 规则：Pending 不超过 15 个；一个 Ticket 一个提交；做完立刻更新这里。

## 当前迭代

P0 骨架 —— 三个页面（首页 / 1 个项目页 / 1 篇笔记页）能拿出手。

> 首页、项目详情、笔记列表、笔记详情、精选都能点开，404 有正经页面。P0 完成；P1 先做了「精选」——不再是 HelloGitHub 搬运，改成从 GitHub 抓的 AI 项目（T-010）；T-011 把导航收成 首页 / 精选 / 笔记 三项，三页统一成掘金式三栏；T-012 把视觉语言整体换成掘金那套（灰底白卡 + 蓝主色 + 无衬线）；T-013 把首页的前提从「作品集」换成「证据页」；T-014 又砍掉两块——站点自述和三条代写评测都是假的，首页只剩身份卡 + 8 个真实仓库 + 笔记。T-022 换掉按总星数取 top-N 的发现逻辑，改成滚动窗口查询 + 分桶配额；T-023 把精选并进首页，30 个项目全部有站内中文详情页，左栏改按行业/用途分类；T-024 首页进一步减到「分类 + 列表」，个人信息、口号、最近在写和笔记区块全撤，代码块统一成深色 GitHub Dark；T-025 把分类拆成领域 / 形态 / 对标三层，左栏只留领域，形态作为标签；T-026 收录用户新整理的 43 个 GitHub 项目，跳过 2 个重复项，首页扩到 73 条并补齐站内详情页；T-027 把 Grill Me 从 RobMitt/grill-me-skill 修正到 mattpocock/skills 里的 /grill-me；T-028 把 T-026 的 42 篇新详情页从简介级加深到 1200 字以上，并用测试锁住「至少 1000 字 + 区分 README 与编辑判断」；T-029 把旧 30 篇也加深到 1500–2000 字，并给 README 里有真实产品图的 20 篇新页补上 banner。

## 进行中

| ID | 任务 | 负责人 | 开始时间 |
|---|---|---|---|
| | | | |

## 待办（按依赖排序）

| ID | 任务 | 依赖 | 预估轮数 |
|---|---|---|---|
| | P1 待拆（项目库筛选、关于页、Pagefind） | | |

## 已完成

| ID | 任务 | 提交 | 验证证据 |
|---|---|---|---|
| T-001 | 脚手架 + 设计 token + 字体 | `60d6f96` | `node --test` 4/4 绿；`tsc --noEmit` 0；`next build` `/` 为 `○ Static`；HTTP 200；样式表含 `--text-display: 40px` / `--container: 1200px` / `FAF9F6` |
| T-002 | SiteHeader + 页脚 + 暗色切换 | `164e707` | `node --test` 10/10；build 静态；CDP 实测暗色 `rgb(18,18,17)`、刷新保留、首帧即暗色（无白闪）、375px 无横向溢出、1440px header 56px sticky |
| T-003 | 首页主张区与空状态 | `3ef768b` | `node --test` 14/14；build 静态；h1 `40px/48px` 且为 Noto Serif SC；`time` bottom 338 ≤ 900 无需滚动；空状态块 138/157px，最大间隙 96px |
| T-004 | 内容层：Zod schema + 读取 + 样例 MDX | `ec672ea` | `node --test` 21/21；三处破坏性验证均 exit 1（缺字段 / 枚举错 / 互链悬空）并已恢复 md5；首页日期由构建日变为 `2026.11.20` |
| T-005 | 项目卡片/行/结论标签 + 首页两块列表 | `88c8444` | 裁判 5/7：`node --test` 27/27；3 个 `/projects/` 链接；行高 72；`推荐` 底色 `rgb(196,68,44)`、`别碰` `line-through`；375px 无溢出。AC-5（MetaBar）/AC-7（alt）未达成，已移交 T-006 |
| T-006 | 项目详情页六段式 + MetaBar + 相邻导航 | `71ca74f` | 裁判 9/9：`node --test` 31/31；build 三条 slug 全 `●`；`/projects/nope` 404；六段 h2 各 2 次；375px `scrollWidth=375`、1440px 正文 720；MetaBar 六项 `tabular-nums`。返工两次（移动端 grid 隐式列按 max-content 撑到 400.6px；16:10 占位在 1200 容器里变成 1150×719 空白块） |
| T-007 | 笔记列表 + 笔记详情 + 目录 + 构建期高亮代码块 | `b33848c` | 裁判 8/8：`node --test` 41/41；`○ /notes` + `● /notes/[slug]`；复制按钮读回原文一致；1440 目录 sticky（滚动后 top 仍 96）、1024 隐藏；正文 720/28px；375px 无溢出；表格/列表/引用都渲染出来。另修 `readingTime` 手填 6 分钟与实际 2 分钟不符（改为现算），页脚浮空（body 改 flex） |
| T-008 | P0 收口：404、项目库、溢出与 alt 通检 | `181dad7` + `3c55594` | SPEC 9 条 P0 验收 9/9：6 路由 × 375/1440 共 12 次 `scrollWidth===clientWidth`；`/nope` 404 且有返回首页；删 `license` 字段构建 exit 1 后 md5 还原；`node --test` 41/41。第二轮裁判要求补的三项见下：`pnpm check:alt`（空集退出码 2）、详情页渲染「替代 / 适合 / 不适合」、AC-6 改按 SPEC 9 条 |
| T-009 | HelloGitHub 精选：分类 tab + 单列卡片 + 导入脚本 | `052fa4b` | 7/7：导入 41 条草稿与源文件一致；`○ /picks`；点「Go 项目」剩 2 张、点「全部」回 7 张；链接全 github + noopener；375/1440 无溢出；删 `why` 构建报 `entries.6.why: rubik/radon：Required` 后 md5 还原；`node --test` 46/46 |
| T-010 | 精选改 AI 雷达：GitHub 同步脚本 + 掘金式列表 + 换文案与高亮 | `c6fcb7c` | `node --test` 51/51；typecheck 0；lint 0 error；build 11 页全 `○`/`●`；`pnpm sync:picks` 拉到 26 条 + 26 张头像；`/picks` 1440 高 3416（首屏 6 行）、375 `scrollWidth=375`（修掉 315px 项目名撑出的 14px 溢出）；点 tab 实测 全部 26 / 涨得快 10 / Agent 13 / MCP 3 / 其它 7，与 tab 上的数字一致；`aria-selected` 跟随、链接全 `noopener`；`pnpm check:alt` 26/26；代码块换 vitesse 双主题、行内代码加 `--line` 底 |
| T-011 | 信息架构重构：导航收成三项，三页统一三栏；精选拆成「分类 × 涨得快」两轴；首页去掉占位截图卡 | `217e616` | `node --test` 73/73；typecheck 0；lint 0 error；build 10 页全 `○`/`●`；三栏实测 1440/1280 → 200/592/280、1024 → 160/784、768 → 160/528、375 → 335，3 路由 × 5 档 `scrollWidth - clientWidth = 0`；滚 600px 后左右栏 `top = 72`（sticky 生效）；`/projects` 308 → `/`；导航 3 项且 `aria-current` 跟随路径（`#1a1917` vs `#6e6a63`）；筛选实测 26 → 涨得快 10 → Agent 6 → MCP 1 → 只 MCP 3，`aria-pressed` 跟随、`aria-live` 报「6 个」、`[role=tab]` 数为 0；`pnpm check:alt` 26/26 |
| T-012 | 视觉语言换成掘金式：灰底白卡 + 蓝主色 + 无衬线，masthead 压成一条 | `2de73d6` | `node --test` 76/76；typecheck 0；lint 0 error；build 10 页全 `○`/`●`；先量 juejin.cn 拿到画布 `#f2f3f5`、卡片白 4px、行高 99、主色 `#1e80ff`；三栏 1440/1280 → 180/672/260、1024 → 180/776、768 → 180/520、375 → 335，15 组零溢出；h1 实测 28px/600/无衬线，`grep font-serif` 无结果；滚 600px 左右栏 `top = 76`；修掉 `overflow-hidden` 让筛选行压住第一行（barTop 248 → 188）；对比度四条断言全过（正文 7+、次要 4.5+、蓝字 4.5+、白字压 fill 4.5+）；暗色 `rgb(23,24,26)` / 卡片 `rgb(35,35,36)`；`pnpm check:alt` 26/26 |
| T-013 | 首页换前提：从「作品集」改成「证据页」——身份卡 + 这个站本身 + 8 个真实仓库 | `b2a7879` | `node --test` 80/80；typecheck 0；lint 0 error（5 条 warning 全在 `.audit/` 探针）；build 10 页全 `○`/`●`；3 路由 × 5 档 15 组零溢出；身份卡 `top 80 / h 140`，「求职中」徽章 `rgb(22,104,201)` 白字；四块 `site:247 picked:392 repos:657 notes:127`，`pageH 1785`；左栏 4 锚点全命中；`最近在写` 8 行、链接全指 `github.com/wangliang01/*`；375 下定位句单行（`taglineH 28`）；滚 700px 左右栏 `top = 76`；暗色 `rgb(23,24,26)` / 卡片 `rgb(35,35,36)`；`/projects` 308；`pnpm check:alt` 31 张全有 alt |
| T-014 | 首页砍掉站点自述与三条代写评测，定位句改成「在做什么」 | `a97c1bc` | `node --test` 69/69；typecheck 0；lint 0 error；build 7 页全 `○`/`●`；定位句 `前端 + Node，最近在做 AI 工具`，测试锁死不许出现「在补 / 还在学 / 入门」；`/projects/cal-com`、`/n8n`、`/uptime-kuma` 全 404，`content/projects` 与 `app/projects` 已不存在；首页只剩 `repos:678 / notes:127` 两块；左栏 `轨迹8 / 精选26 / 笔记1`；15 组零溢出；375 `taglineH 28` 单行；`pnpm check:alt` 31 张全有 alt |
| T-015 | 精选自动化：一天 4 次同步 + 首次上榜台账 + 分页滚动 | `0a4302a` | `node --test` 77/77；typecheck 0；lint 0 error；build 7 页全 `○`/`●`；台账 5 条测试（首次/二次/同日重复/120 天剪枝/键序稳定）；快照 26 条全有 `firstSeen`，`history.json` 全覆盖；CDP 实测首屏 12 条 → 滚到底 26 条、按钮消失；「新上榜」徽章实测渲染 1 个（临时挪日期验证后恢复），首日全为新时守卫不显示；`picks-cron.mjs` 端到端跑通并生成 `08be5f8`，只提交 `content/picks` + `public/avatars`，工作区其他改动没被带走；375/1440 零溢出 |
| T-016 | 正文插图：`img` 渲染 + `Figure` 图注 + `juejin-illustration` skill | `34dffd2` / `de6e08b` | `node --test` 78/78（新增一条插图守卫：懒加载 / 宽度约束 / 图注组件 / 注册）；typecheck 0；lint 0 error 0 warning；build 9 页全 `○`/`●`；`pnpm check:alt` 17 张全有 alt（此前一直是「0 张图，空集不算通过」）；示意图 1440 → 420×304、375 → 293×219，暗色下 `var(--accent-soft)` 等 token 正常切换；`llmops-token-context` 正文 6 个 h2、1 张表、1 张内联 SVG | 
| T-017 | 正文排版对齐掘金实测值：正文改近黑色、h2 22px 带下边框、行内代码红底、表格蓝表头 | `dde53b1` | `node --test` 79/79（新增正文配色 AA 断言）；typecheck 0；lint 0 error；build 9 页全 `○`/`●`；CDP 实测 p `16/28` `rgb(37,41,51)` mt22、h2 `22/34.1` 700 下边框 pb12、行内代码 `rgb(207,60,26)` on `rgb(255,245,245)` 13.92px、表头 `rgb(0,91,183)` on `rgb(223,240,255)`、引用 4px `rgb(203,203,203)`、标题 28/600；掘金原值 `#ff502c` 只有 3.05:1，压深到 `#cf3c1a` 4.55:1；375 下表格容器内横滚 145px，页面零溢出 |
| T-018 | 代码块重做：圆角 + 灰头部 + 蓝点标签 + 可点复制按钮；高亮换 github 主题 | `187f36b` | `node --test` 79/79；typecheck 0；lint 0 error；build 9 页全 `○`/`●`；`pnpm check:alt` 17/17；浅/深两版 × json / ts / 带文件名三种块都截了图，1440 与 375 零溢出；换主题的理由：`lib/highlight.ts` 原注释还是「压不住 --bg 的米色」，底色早换成掘金灰白，vitesse 的黄绿调跟蓝主色打架 |
| T-019 | 部署上线 `blog.wlv587.top`：`output: "export"` 静态导出交给已有的 Caddy 容器发文件 | `5ecddd8` | `node --test` 79/79；typecheck 0；lint 0 error；build 9 页全 `○`/`●`；线上 `/` `/notes` `/notes/llmops-token-context` `/picks` 全 200，`/projects` 308、`/notes/does-not-exist` 404；CSS `Cache-Control: public, max-age=31536000, immutable`；首页 `imgBroken: 0`；1440/375 零溢出；`wlv587.top` 200 / `omni` 307 / `tv` 404（本来就如此）三个老站点未受影响；内存增量为零（没有 Node 进程） |
| T-020 | 精选定时任务在 GitHub Actions 上真正跑起来，并顺手修掉「推送成功却报失败」 | `b828092` / `fbd8bb6` | workflow 文件在 master 上但 `total_count: 0`，改一行再推 10 秒内变 `active`（纯索引问题，不是权限/YAML/分支）；run `45027679239` 19 秒 success 但日志谎报「推送失败」——`execFileSync` 在 `stdio: "inherit"` 时返回 `null`，`.trim()` 抛错被 catch 吞掉，改成 `(out ?? "").trim()` 后 run `45027856326` 正确打印「已推送」；CI 部署 run `45028362303` 46 秒 success，线上 `/picks` HTML 里查到该版 `473510` / `395030` / `323847`；部署后 6 条路由状态码未退化；`node --test` 79/79（308 断言从 `next.config.ts` 改查 `deploy/Caddyfile`） |
| T-021 | 推 master 自动部署：新增 `deploy.yml`，ssh key 引导收进 `deploy.sh` | `623400e` | 推 `623400e` 后 `deploy` workflow 自动被触发（`event: push`），run `45028771030` success；线上 `/srv/blog/index.html` mtime `21:41:34 +0800` 与该 run 的构建时间一致，`Last-Modified` 也是同一时刻；5 条路由状态码未退化（`/` `/notes` `/notes/llmops-token-context` `/picks` 200、`/projects` 308）；`bash -n scripts/deploy.sh` 通过；`node --test` 79/79 |
| T-022 | 精选发现换成「9 条滚动窗口查询 + 分桶配额」，不再永远同一批 26 个 | 未提交 | 30 条里 11 条 fresh（30 天内新建）、19 条 anchor；19 个仓库首次上榜写入 `history.json`；查询矩阵 7/7、选择 8/8 测试绿；同步脚本按 `trendScore` 倒序落盘，保留人工 `why` |
| T-023 | 30 个精选全部补中文站内详情页；分类改为行业/用途单轴 | 未提交 | 30 篇 `content/repos/*.mdx` 全部过 schema，固定五节；`readmeSha` 与 `.cache/readme` 逐条一致；首页 30 个 `/picks/<slug>` 链接、0 个「整理中」；左栏 14 个非空分类，「视频剪辑」筛选实测 5 条；`/picks` 308 → `/`；`node --test` 108/108；`tsc` 0；build 41 页（30 个详情页全 `●`）；`check:alt` 20/20 |
| T-024 | 首页减负 + 详情页对齐掘金：banner、右栏三卡、深色代码块 | 未提交 | 首屏直接从分类 + 列表开始（身份卡、可见口号、最近在写、笔记区块、右栏个人卡全撤）；代码块 `#0d1117`、注释 `#8b949e`（约 6:1）；详情页左文章卡（标题 → meta → banner → 正文）+ 右三张卡：项目信息（头像/结论/Stars·语言·收录/许可证/GitHub 按钮/sha）、目录（滚动高亮）、相关推荐（同分类星数 top4）；banner 取自 README 首图，24/30 篇有、24 条 URL 全部 HEAD 200，其余不渲染；GitHub 链接在 meta 行；`node --test` 108/108；`tsc` 0；build 41 页；`/picks` 308；浅/暗色截图确认 |
| T-025 | 分类拆成领域 / 形态 / 对标三层 | 未提交 | 30 篇详情页迁移到 `domains` + `forms`，t3code 标为「编码与开发 / Agent 控制面 / 对标 Orca」；首页左栏改叫「领域」，精选行同时显示领域与形态；`node --test` 109/109；`pnpm typecheck` 0；`pnpm lint` 0 error（2 条既有 warning）；`pnpm build` 41 页静态导出 |
| T-026 | 收录 43 个新项目：去重、中文详情页、首页上榜 | 未提交 | 46 个名字去重后跳过 `caveman`、`hyperframes`；`GASP` → GSAP、`modren` → modern、`Skill Creator` → `anthropics/skills`；43 篇详情页固定五节、`readmeSha` 对齐 `.cache/readme`；首页 73 条按 `trendScore` 倒序、43 条新条目写入 `history.json`；`node --test` 109/109；`pnpm typecheck` 0；`pnpm lint` 0 error（2 条既有 warning）；`pnpm build` 84 页静态导出 |
| T-027 | 修正 Grill Me 来源为 `mattpocock/skills` | `666bbae` | 删除 `RobMitt/grill-me-skill` 详情页与头像；新增 `mattpocock/skills` 页，写清 `/grill-me`、`grilling`、`/grill-with-docs` 的关系；首页与台账同步替换；`node --test` 110/110；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm build` 通过 |
| T-028 | 加深 42 篇新收录详情页 | `666bbae` | 42 篇正文 1,203–1,531 字，固定五节，README 说法与编辑判断分开写；新增守卫测试：`sources: [github, toutiao]` 的页面正文 ≥1000 字且出现「README」与「编辑判断 / README 未说明」；73 篇详情页的 frontmatter 与 README sha 逐字节比对未变；`node --test` 110/110；`pnpm typecheck` 0；`pnpm lint` 0 error（2 条既有 warning）；`pnpm build` 通过 |
| T-029 | 旧 30 篇加深到 1500–2000 字，新页补 README 配图 | `462e581` | 旧 30 篇正文 1,513–1,871 汉字，全部五节，README 与编辑判断分离；新 42 篇里 20 篇补了 `banner`，24 条旧 banner + 20 条新 banner 全部 GET 返回图片；徽章、赞助商 logo、应用图标、wordmark、非图片嵌入一律跳过，无图页面不渲染占位；测试扩展：旧页 ≥1500 汉字、全站必须出现「README」与「编辑判断 / README 未说明」；`node --test` 110/110；`pnpm typecheck` 0；`pnpm lint` 0 error（2 条既有 warning）；`pnpm build` 通过，73 页里 44 页有 banner |

### P0 验收（SPEC「验收标准」9 条，2026-11-22 跑）

| # | 内容 | 结果 |
|---|---|---|
| AC-1 | `pnpm install && pnpm typecheck` 退出码 0 | ✅ 0 / 0 |
| AC-2 | 路由表含 `/`、`/projects/[slug]`、`/notes/[slug]` 且全静态 | ✅ 10 页全 `○`/`●`，无 `ƒ` |
| AC-3 | 三页 200 | ✅ `/` `/notes` `/projects/cal-com` `/notes/why-mdx` 全 200（`/projects` 在 T-011 后 308 → `/`） |
| AC-4 | 375 / 1440 无横向滚动 | ✅ 12 次全 `true`（6 路由 × 2 档） |
| AC-5 | 首页首屏含 `\d{4}\.\d{2}\.\d{2}` | ✅ `2026.11.20` |
| AC-6 | 项目页六段标题齐全 | ✅ 6/6 |
| AC-7 | 笔记页含「我还没搞懂的部分」 | ✅ 1 |
| AC-8 | 所有 `img` / `Image` 有非空 alt | ✅ `pnpm check:alt`：当前 0 张图 → 退出码 2「空集不算通过」；临时放真实截图后报「1 张图，全部有非空 alt」 |
| AC-9 | 删必填字段后构建必须失败 | ✅ `license: Required`，exit 1，已 md5 还原 |

## 阻塞 / 待决策

| 问题 | 需要谁决定 | 影响范围 |
|---|---|---|
| R-6：`node --test` 能否直跑 `.ts` | 已实测：可以（Node 24.16，仅一条 reparse 警告） | 测试命令沿用 |
| R-4：Noto Serif SC 子集化 | 已实测：`subsets: ["latin"]` + `preload: false`，构建 11.6s 通过 | 标题字体 |
| 导航里的 `/projects`、`/about` 在 P0 期间是 404 | 已解决（T-008）：`/projects` 建了列表页；`/about` 从导航移除，等你写完 bio 再加回 | 已关闭 |
| 主题按钮的图标靠 `useEffect` 回读，SSR 恒为太阳图标，暗色用户会看到图标跳一下 | 未处理，P1 里挑一版纯 CSS 方案再评估 | 首屏观感 |
| 375px 下 40px 主张把"项目"拆成两行（CJK 断词） | 已解决（T-008）：`text-balance`；现文案在 375 断成「我跑过的开源 / 项目，和它们 / 的真实成色。」，没有新增字号档 | 已关闭 |
| 首页 `updatedAt` 取构建时间，`No.001` 硬编码 | 已解决：改为 `max(publishedAt)` 与 `getIssueNumber()`（T-004） | 已关闭 |
| `content/**` 三份项目 + 一篇笔记都是代写骨架，不是真实跑过的记录 | 上线前由你自己替换（尤其"我的判断""我还没搞懂的部分"） | 内容可信度 |
| `lib/profile.ts` 的 `PROFILE` 是空对象，右栏只显示站点名与主张兜底 | 填上头像 / 名字 / 一句话 / GitHub / 邮箱 / 状态城市技术栈；空字段会自动不渲染，不会出现「未填写」 | 右栏完整度 |
| `forWho` / `notFor` / `replaces` 仍是必填，但没有任何渲染点 | 已解决（T-008）：详情页渲染「替代 Calendly」与「适合 / 不适合」两栏 | 已关闭 |
| `alternatives` 渲染路径已实现，但三条内容都是空数组，页面上看不到 | 补内容时填 2–3 个真实站内替代品 | 详情页完整度 |
| 干净构建（`rm -rf .next` 后）需要能访问 Google Fonts | `next/font` 在构建时下载字体，本次出现过一次失败重跑即过；真要离线构建就换自托管（P1） | 构建稳定性 |
| 精选 26 条目前都没有 `why`（同步脚本不写，字段是可选的） | 挑 3–5 条写你自己的判断；不写就只显示简介，页面不会空着 | 内容可信度 |
| `sync:picks` 依赖 `curl`（Node 的 fetch 不走系统代理，直连 raw.githubusercontent.com 会 `ECONNRESET`） | Windows 自带 curl 可用；换机器或 CI 上跑要确认这一点 | 工具可用性 |
| `sync:picks` 每次跑 2 次 search + 26 次头像下载，走 GitHub 匿名额度 | search 限 10 次/分钟、core 限 60 次/小时，一周跑一次够用；连续重跑会被限流，需要时加 token | 数据新鲜度 |
| 精选数据源从 HelloGitHub 换成 GitHub API，`import:hg` / `lib/hellogithub.ts` / `content/picks/hellogithub-100.mdx` 已删 | 已决策（T-010）：要的是「AI + 高星/涨得快」，HelloGitHub 的分类和主题对不上 | 已关闭 |
