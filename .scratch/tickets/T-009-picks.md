# [T-009] HelloGitHub 精选：分类 tab + 单列卡片，一句判断才算收录

- **Status**: Done
- **Depends On**: T-004（schema 与内容层）
- **Target Files**:
  - `lib/schema.ts`、`lib/content.ts`（新增 picks）
  - `scripts/import-hellogithub.mjs`（半自动导入）
  - `app/picks/page.tsx`、`components/pick-list.tsx`
  - `components/site-header.tsx`（导航加一项）
  - `content/picks/*.mdx`

## 要解决的问题

雷达里每条都要写六段，成本高，所以只收"我跑过、有判断"的少数项目。HelloGitHub 那类条目是"值得看一眼"的量级，混进雷达会把密度冲淡。单开一栏，用一句话判断承接，不写六段、不建详情页。

## 范围

- 做：`/picks` 列表（分类 tab + 单列卡片）；`content/picks/<issue>.mdx` 一期一个文件、frontmatter 里放条目数组；`pnpm import:hg <期号>` 从 HelloGitHub 仓库拉当期的 markdown，生成 `.scratch/import/` 下的草稿；导航加「精选」。
- 不做：详情页、图片、站内搜索、自动定时抓取（脚本手动跑）。

## 关键决定

- **判断必须自己写**：`why` 是必填且非空，schema 直接卡住。照抄 HelloGitHub 的简介不算收录，这条栏目的价值就是那句判断。
- **导入只生成草稿到 `.scratch/import/`**，不直接写进 `content/`：草稿里 `why` 是空的，直接进内容目录会让构建失败。
- **一期一个文件**，条目放 frontmatter 数组：轻量条目没必要一项目一文件，20 个文件反而难改。
- **tab 在客户端过滤**：服务端先渲染全部卡片（默认「全部」），HTML 里有内容，JS 挂了也能看。

## 验收标准（必须可执行）

- [x] AC-1：`pnpm import:hg 100` 退出码 0，生成的草稿条目数等于源文件里 `N、[` 行数
- [x] AC-2：`pnpm build` 路由表出现 `/picks`，标记为静态（`○`）
- [x] AC-3：浏览器点某个分类 tab 后，可见卡片数等于该分类的条目数；点「全部」恢复
- [x] AC-4：卡片上的外链指向 `github.com/<owner>/<repo>`，带 `rel="noopener"`
- [x] AC-5：375px 与 1440px 下 `/picks` 均 `scrollWidth === clientWidth`
- [x] AC-6：删掉某条的 `why` 后 `pnpm build` 必须失败，提示写明是哪一条
- [x] AC-7：导航出现「精选」，`/picks` 返回 200

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：源文件 `^[0-9]+、\[` 41 行，草稿 41 条；分类 13 个（C / C# / C++ / Go / Java / JavaScript / Kotlin / Python / Rust / Swift / 人工智能 / 其它 / 开源书籍）
  - AC-2：`○ /picks 1.13 kB`，11 页全静态
  - AC-3：CDP 点「Go 项目」→ 可见 2 张（gdu、buildg），点「全部」→ 7 张
  - AC-4：7 张卡片的链接全部匹配 `^https://github\.com/[^/]+/[^/]+$`，`rel` 含 `noopener`、`target="_blank"`
  - AC-5：375 → 375/375；1440 → 1440/1440
  - AC-6：删掉 radon 的 `why` 后构建输出 `entries.6.why: rubik/radon：Required`，exit 1，已用 md5 还原（`e0b3c1…`）
  - AC-7：导航「雷达 / 精选 / 笔记」，`/picks` 200
  - 截图：`t009-picks-1440.png` / `t009-picks-375.png`
- 实现说明：
  - 解析逻辑抽到 `lib/hellogithub.ts`（纯函数），脚本只负责取数、写文件，测试直接打 fixture：目录段、赞助段、非 GitHub 仓库都要被正确排除。
  - 抓取用 `curl` 而不是 `fetch`：Node 的 fetch 不走系统代理，直连 raw.githubusercontent.com 会被重置。
  - `--stars` 会按仓库打 GitHub API 补真实星数和语言（匿名 60 次/小时）。第一版我按印象填了估值，已全部换成 API 返回的真数——星数这种数字不能猜。
  - 草稿只写 `.scratch/import/`：`why` 为空，进 `content/` 会让构建失败，这是故意的。
- 已知取舍：7 条精选的 `why` 是我写的占位判断（和项目正文一样），需要你换成自己的；`content/picks` 一期一个文件，条目多了再考虑拆。
