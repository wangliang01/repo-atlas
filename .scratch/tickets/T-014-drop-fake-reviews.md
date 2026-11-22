# [T-014] 首页去掉两块自说自话，定位句改成「在做什么」

- **Status**: Done
- **Depends On**: T-013（首页刚换成证据页）
- **Supersedes**: T-013 里的「这个站本身」与「我跑过、并给了结论的」两块
- **Target Files**:
  - `lib/profile.ts`（定位句）
  - `app/page.tsx`（删两块，左栏目录重排）
  - 删除：`content/projects/*.mdx`、`app/projects/`、`components/project-lead.tsx`、`verdict-badge.tsx`、`verdict-note.tsx`、`about-site.tsx`、`meta-bar.tsx`、`project-row.tsx`
  - `lib/content.ts`、`lib/schema.ts`、`lib/labels.ts`（砍掉项目相关内容）
  - `components/picks-view.tsx`、`pick-row.tsx`（去掉「已跑过」入口）
  - 测试：删 `lib/detail.test.ts`，改 `lib/schema.test.ts`、`lib/home.test.ts`、`lib/components.test.ts`、`lib/picks.test.ts`

## 要解决的问题

T-013 交付后用户提了三点，都是对的：

1. **「前端出身，在补 Node 和 AI 应用」会让人直接 PASS。** 「在补」是缺口式表达，招聘的人扫一眼读到的是「不会」。而且它跟「不吹」的原则不冲突——仓库里有 `koa-api-template`、`imooc-backend`、`resume-forge-skill`，写「在做」有据可查。
2. **「这个站本身」没必要介绍。** 访客不关心你的站有几个测试，那是给自己看的。
3. **「我跑过、并给了结论的」是假的。** 三条评测是 T-005 时代按骨架代写的，不是真跑出来的。一个自称证据页的站上摆着假证据，比不摆更糟——而且三个详情页还挂在线上，谁点开都能看到。

## 范围

- 做：定位句改成能力陈述；首页删掉两块；三个假评测连同路由、内容、组件、schema 一起删；精选行去掉「已跑过」入口。
- 不做：不保留「以后也许用得上」的空路由。要恢复就 revert 这个提交，再把 `content/projects/` 换成真内容。

## 关键决定

- **定位句 = `前端 + Node，最近在做 AI 工具`**。三条标准：以能力开头（不是以缺口开头）、每个名词都能在下面点开核对、有方向感（招聘的人要知道你能干什么活）。不用「前端出身」（容易被读成转行），不用「热爱技术 / 持续学习」（零信息）。
- **首页只留三块**：身份卡 → 最近在写（8 个真实仓库）→ 笔记。宁可薄，不拿假内容撑。
- **左栏目录跟着收**：轨迹 8 / 精选 26 / 笔记 1。精选不是本页锚点，直接跳 `/picks`。
- **删干净而不是隐藏**。`/projects/cal-com` 这些页面如果留着，搜索引擎和好奇的人照样能找到，等于把假内容留在线上。

## 验收标准（必须可执行）

- [x] AC-1：`node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error
- [x] AC-2：`pnpm build` 全 `○` / `●`，页数从 10 降到 7
- [x] AC-3：首页 h1 下一行是「前端 + Node，最近在做 AI 工具」，不含「在补」
- [x] AC-4：首页不再出现「这个站本身」「我跑过」「推荐：现在就在用」任何一处
- [x] AC-5：`/projects/cal-com`、`/projects/n8n`、`/projects/uptime-kuma` 全部 404
- [x] AC-6：`content/projects` 目录与 `app/projects` 路由目录不存在
- [x] AC-7：首页仍是三栏，左栏 3 项（轨迹 / 精选 / 笔记）且计数正确
- [x] AC-8：375px 下定位句不出现孤字，页面零横向溢出
- [x] AC-9：`pnpm check:alt` 通过

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：`node --test` 69/69；`tsc --noEmit` 0；`eslint` 0 error（7 条 warning 全在 `.audit/` 探针）
  - AC-2：`○ /` `○ /picks` `○ /notes` `● /notes/[slug]` + `/_not-found`，7 页，无 `ƒ`
  - AC-3：`h1 28px/600/Inter`，下一行 `前端 + Node，最近在做 AI 工具`；`lib/profile.test.ts` 断言不含「在补 / 还在学 / 正在学 / 入门 / 小白」
  - AC-4：`lib/home.test.ts` 断言首页不含 `<AboutSite` / `<ProjectLead` / `<VerdictNote` / `id="site"` / `id="picked"`；页面实测 `sections repos:678 notes:127`
  - AC-5：`/projects/cal-com` `/projects/n8n` `/projects/uptime-kuma` 全部 `404`
  - AC-6：`content/` 只剩 `notes/` `picks/`；`app/projects` 目录不存在
  - AC-7：左栏 `["轨迹8","精选26","笔记1"]`，锚点 `#repos /picks #notes`
  - AC-8：3 路由 × 5 档 15 组溢出 0；375 下 `taglineH 28`（单行）、`cardH 266`
  - AC-9：`31 张图，全部有 alt 属性；其中 26 张标为装饰（alt=""）`
  - 其他：三栏 `[180,672,260]`；暗色 `rgb(23,24,26)` / 卡片 `rgb(35,35,36)`；滚到底左右栏 `top 76`
  - 截图：首页 / 精选 / 笔记 × 1440 / 375 六张整页，交付前逐张看过
- 实现说明：
  - 删了 7 个组件（`project-lead`、`verdict-badge`、`verdict-note`、`about-site`、`meta-bar`、`project-row`、`topic-chip`）、1 个空状态（`empty-issue`）、1 个测试文件（`detail.test.ts`）、3 篇内容、整条 `/projects/[slug]` 路由。
  - `lib/content.ts` 去掉 `Project` 类型、`getAllProjects`、`getProject`、`getProjectSlugByRepo`、`getIssueNumber`、`getAdjacentProjects`；`getSiteCounts()` 从四个字段降到三个（`notes / picks / updatedAt`）。
  - 精选行去掉「已跑过」入口（`PickRow` 的 `projectSlug` prop 一起删），`PicksView` 不再接 `projectByRepo`。
  - 页脚、`layout.tsx` 的 description、`ProfileCard` 的兜底句原来都是「我跑过的开源项目，和它们的真实成色」——评测删了以后这句是假的，统一改成「我写的仓库，和我正在看的项目」。
  - 仓库行的描述从 `truncate` 改成 `line-clamp-2 + text-balance`：375px 下 `imooc-frontend` 会把「端」单独甩到第二行，`text-balance` 之后两行长度接近。
- 已知取舍：
  - 首页只剩两块内容，比 T-013 薄。这是对的——宁可短，不拿假内容撑。
  - `/projects` 的 308 重定向留着（老链接兜底），但它现在指向首页而不是列表页。
  - 要恢复评测：`git revert` 这个提交，再把 `content/projects/` 换成你真跑过的记录；schema、组件、路由都会一起回来。
