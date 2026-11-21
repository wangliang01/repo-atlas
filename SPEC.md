# Repo Atlas

> 工作标题：**Repo Atlas / 项目地图** · 文档版本 v1.0（2026-11-21，由 v0.1 规格收敛而来）

## 一句话

把值得读的开源项目拆开看：个人技术名片 + 开源项目档案库，不是内容平台。

## 用户与场景

| 优先级 | 谁 | 他在这里做什么 |
|---|---|---|
| P0 | 面试官（全栈 / AI 应用方向） | 10 秒判断"这个人是谁、什么水平、有没有观点、做得干不干净"；60 秒点开一个项目读到一句明确判断 |
| P1 | 同行开发者 | 搜"能替代 X 的自托管方案"，看边界与上手成本 |
| P2 | 未来的自己 | 三个月后还记得当初为什么推荐 / 不推荐 |

**赢在哪**：判断力（我跑过、我读过）> 信息结构 > 视觉完成度。
**不做成 HelloGitHub 升级款**：那需要团队、投稿、运营；这里要的是一张能证明能力和品味的名片。

## 本期范围（P0 骨架）

只做三个能拿出手的页面，先把设计 token 和排版定死：

1. 设计 token：颜色 / 字号六档 / 间距 / 容器 / 字体，落在 CSS 变量上
2. 首页：主张 + 本期 3 个 + 最新收录 8 条 + 主题入口 + 页脚（内容为空时显示"第一期正在写"）
3. 1 个项目详情页（六段式）
4. 1 篇笔记详情页（Prose + 目录 + 代码块）
5. `SiteHeader` + 页脚 + 暗色切换
6. 内容层：MDX + gray-matter + Zod 校验，1 个项目 + 1 篇笔记样例
7. `verify-app` 技能可跑通

## 明确不做（Non-goals）

**第一版永久不做**：评论、登录、投稿、CMS、运行时数据库、多语言、PWA、标签云、滚动动画、3D、鼠标跟随、大图 hero、轮播、侧边栏二维码。

**P0 暂不做（后续阶段做，不许提前）**：

| 项 | 阶段 |
|---|---|
| 列表筛选 / 排序 / 视图切换、6 个项目、3 篇笔记、关于页 | P1 |
| Pagefind + ⌘K、主题页、RSS、sitemap | P2 |
| 向量索引、`/api/ask`、流式回答、评估集 | P3 |
| 动态 OG 图、Lighthouse ≥ 95、404 搜索框、动效细节 | P4 |

> 顺序不能反。P0 没做好就做 AI，最后得到一个"有 AI 功能的丑站"。

## 验收标准（可执行）

P0 完成的定义，逐条跑，任何一条不过就不算完成：

- [ ] **AC-1** `pnpm install && pnpm typecheck` 退出码 0
- [ ] **AC-2** `pnpm build` 成功，路由表输出含 `/`、`/projects/[slug]`、`/notes/[slug]` 三条，且均为静态（`○` 或 `●`，无 `ƒ`）
- [ ] **AC-3** `pnpm dev` 后三页均 200：`curl -s -o /dev/null -w "%{http_code}" localhost:3000/`（其余两页同理）
- [ ] **AC-4** 375px 与 1440px 视口下无横向滚动：浏览器控制台执行
      `document.documentElement.scrollWidth <= document.documentElement.clientWidth` → `true`
- [ ] **AC-5** 首页首屏 HTML 含"最近更新日期"，格式匹配 `\d{4}\.\d{2}\.\d{2}`
- [ ] **AC-6** 项目页含六段式全部标题：它是什么 / 我的判断 / 技术看点 / 怎么上手 / 边界 / 替代品
- [ ] **AC-7** 笔记页含文末小节「我还没搞懂的部分」
- [ ] **AC-8** 所有 `<img>` / `<Image>` 均有非空 `alt`：`grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"'` 无输出
- [ ] **AC-9** `content/projects/*.mdx` 故意删一个必填字段后 `pnpm build` 必须失败（Zod 校验生效）

## 技术决策

| 项 | 选择 | 理由 |
|---|---|---|
| 框架 | Next.js 15 App Router + TS strict | 面试全栈/AI 方向，RSC + Route Handler 都能讲；代价是必须坚持静态优先 |
| 样式 | Tailwind v4 + CSS 变量 | token 落在变量上，暗色切换只换变量 |
| 内容 | MDX + gray-matter + Zod | 无数据库，Git 即 CMS，构建时校验失败即构建失败 |
| 代码高亮 | Shiki（rehype-pretty-code） | 构建时高亮，零运行时 |
| 搜索 | Pagefind（P2） | 静态索引，零后端 |
| AI | Vercel AI SDK + 向量检索（P3） | 必须带 slug 引用、有评估集、可降级 |
| 部署 | Vercel | 预览环境、Analytics、OG 生成 |
| 包管理器 | pnpm 8.12 | 本机已装，Next 生态首选 |
| 单测 | Node 24 内置 `node --test` | 零新增依赖，可直跑 `.ts`；T-004 首次验证 |
| 为什么不用 Astro | — | 内容站 Astro 更合适，但需要练 RSC / Route Handler / 流式响应；约束是全站 SSG |

## 硬约束（改代码前必读）

**设计 token 唯一来源**：`app/globals.css` 的 `:root` / `.dark`。

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAF9F6` | `#121211` |
| `--surface` | `#FFFFFF` | `#1A1A18` |
| `--ink` | `#1A1917` | `#EDEAE3` |
| `--muted` | `#6E6A63` | `#9A958B` |
| `--line` | `#E6E2D9` | `#2A2A27` |
| `--accent` | `#C4442C` | `#E4694F` |
| `--accent-soft` | `#F6E7E2` | `#2B1D19` |

- 字号只有六档：`display 40/1.2`、`h1 32/1.25`、`h2 24/1.35`、`body 16/1.75`、`small 13/1.5`、`micro 12/1.4`（`micro` 加 `tracking .08em`）。**不许新增第七档**。
- 间距只用 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96。容器 1200px，左右 24px（移动 20px），正文列 720px。
- 圆角 ≤ 4px；阴影只允许出现在浮层（搜索、抽屉）。
- 一个强调色，只用于链接、结论标签、当前状态。
- 结构靠 1px 分割线 + 留白，不靠圆角卡片堆叠。
- 数字一律 `font-variant-numeric: tabular-nums`；动效 120–180ms `ease-out`，必须响应 `prefers-reduced-motion`。
- 改任何颜色必须重验对比度：`--muted`、`--accent` 对 `--bg` ≥ 4.5:1。

**内容字段**（`content/projects/*.mdx` frontmatter，Zod 校验）：`name` `repo` `tagline(≤24字)` `verdict(recommend|watch|avoid)` `topics[]` `replaces[]` `deploy(docker|binary|cloud|library)` `setupTime(5min|30min|halfday|day+)` `maintenance(active|slowing|stale)` `license` `language` `stars` `screenshot` `publishedAt` `highlight` `forWho` `notFor` `alternatives[]`。

**路由**：`/`、`/projects`、`/projects/[slug]`、`/notes`、`/notes/[slug]`、`/topics/[slug]`、`/about`、`/search`、`/rss.xml`、`/sitemap.xml`。

## 风险与未知

| ID | 风险 | 应对 |
|---|---|---|
| R-1 | 内容产出跟不上（6 项目 / 3 笔记） | P0 只做 1+1；上线宁缺毋滥 |
| R-2 | P0 无浏览器自动化，横向滚动靠手动断言 | AC-4 写成控制台一行断言，T-008 人工贴 `true` |
| R-3 | Tailwind v4 + Next 15 的 PostCSS 接法与 v3 不同 | T-001 第一件事就是验证 `pnpm build` 通过 |
| R-4 | Noto Serif SC 全量自托管体积过大 | 只用 `unicode-range` 子集；失败则标题回落到系统衬线 |
| R-5 | 设计过度迟迟不上线 | P0 只做 3 页；五条自检过不了三条就改 token，不加新组件 |
| R-6 | 单测方案未验证（`node --test` 直跑 `.ts`） | T-004 首个测试若失败，改用 `tsx` 前先申请 |
