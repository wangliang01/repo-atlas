# [T-006] 随便点开一个项目，60 秒内能读到一句明确的判断

- **Status**: Done
- **Depends On**: T-005
- **预估轮数**: 8
- **Target Files**:
  - `app/projects/[slug]/page.tsx`
  - `components/prose.tsx`（项目正文复用）
  - `components/meta-bar.tsx`、`components/topic-chip.tsx`（从 T-005 移入，此处才有渲染点）
  - `lib/content.ts`（补 `getAdjacentProjects`）

## 要解决的问题

项目页是转化页。README 翻译在这里会立刻被识破，所以模板的六段结构必须被强制出来，不能靠记忆。

## 范围

- 做：`generateStaticParams` 全量预渲染 + `generateMetadata`（title/description 用 `name` + `tagline`）；面包屑；h1 + `VerdictBadge`；`tagline`；`MetaBar`；16:10 截图；MDX 正文按六段式渲染；`alternatives` 渲染为 2–3 张站内卡片（不存在则整块隐藏）；上一篇/下一篇；≥1280px 右侧吸顶栏显示"最后核实于 {publishedAt}"。
- 不做：Toc（项目页内容短，T-007 再实现）、评论区、分享按钮。

## 验收标准（必须可执行）

- [x] AC-1：`pnpm build` 路由表出现 `/projects/[slug]` 且标记为静态（`●`/`○`，非 `ƒ`）
- [x] AC-2：`curl -s localhost:3000/projects/cal-com | grep -c '我的判断'` ≥ 1，且"它是什么/技术看点/怎么上手/边界/替代品"同样各 ≥ 1（六段齐全）
- [x] AC-3：页面 HTML 含 `publishedAt` 对应的 `YYYY.MM.DD`
- [x] AC-4：不存在的 slug 返回 404（`curl -o /dev/null -w "%{http_code}"` 为 404）
- [x] AC-5：`<title>` 含项目名，`<meta name="description">` 非空
- [x] AC-6：上一篇/下一篇链接至少有一个非空（单条目时允许两者都指向列表页）
- [x] AC-7：375px 无横向滚动，正文列宽 ≤ 720px（1440px 下实测）
- [x] AC-8：`MetaBar` 渲染在详情页，六项齐全，计算样式 `font-variant-numeric` = `tabular-nums`
- [x] AC-9：`screenshot` 已改为可选，并在下方完成记录写明原因

> 从 T-005 移交过来两条，本 Ticket 必须补上：
> - **AC-8**：`MetaBar` 渲染在详情页，六项齐全，计算样式 `font-variant-numeric` = `tabular-nums`。必须在浏览器里量，不接受源码字符串断言。
> - **AC-9**：`screenshot` 字段要么真的被渲染（`<img>`/`Image` + 非空 `alt`），要么在 schema 里改成可选并在 Ticket 写明原因。当前状态是：schema 强制必填、三条内容都填了 `/shots/*.webp`、`public/` 目录不存在、没有任何组件读它——这是假字段，不能带进 P1。
> - 首页 6 个 `/projects/<slug>` 锚点目前全 404，本 Ticket 落地后应全部 200。

## 验证方式

```bash
pnpm build && pnpm dev
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/projects/cal-com
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/projects/not-exist
curl -s localhost:3000/projects/cal-com | grep -c '我的判断'
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test` 31/31；`pnpm typecheck` 0；`pnpm lint` 0；`pnpm build` → `● /projects/[slug]`，cal-com / uptime-kuma / n8n 三条全预渲染，无 `ƒ`
  - AC-2：三条页面 h2 均 6/6（它是什么 / 我的判断 / 技术看点 / 怎么上手 / 边界 / 替代品）
  - AC-3：分别渲染 `2026.11.20` / `2026.11.18` / `2026.11.15`，与各自 publishedAt 一致，无时区偏移
  - AC-4：`/projects/nope` → 404（`dynamicParams = false` + `generateStaticParams`）
  - AC-5：`<title>Cal.com · 开源自托管的日程调度 | Repo Atlas</title>`；description = 「开源自托管的日程调度。用 tRPC 把前后端类型打通」
  - AC-6：cal-com 只有「Uptime Kuma →」；uptime-kuma 两侧都有；n8n 只有「← Uptime Kuma」
  - AC-7：CDP 实测 375px `scrollWidth 375 = clientWidth 375`，正文列 335；1440px 正文列 720
  - AC-8：DOM 实测 MetaBar 六项 `32k·TypeScript·Docker·30 分钟·AGPL-3.0·活跃`，计算样式 `font-variant-numeric: tabular-nums`
  - AC-9：截图暂缺，`screenshot` 改为 `.optional()`，页面在缺失时渲染虚线占位条（「截图待补 / calcom/cal.com」）。原因：没有真实截图就不填假路径——T-005 已经因为 `/shots/*.webp` 这种假路径被判过一次
  - 首页 6 个锚点 → 3 个唯一 slug，逐个 200
  - 截图：`t006-1440.png` / `t006-375.png`
- 裁判判定 9/9（AC-9 初判存疑，仅因本条记录当时为空）。
- 返工记录：
  - **375px 横向溢出 422 > 375**。根因不是长单词，而是移动端只有隐式单列：`grid-auto-columns: auto` 按 `max-content` 定宽（400.6px），超出 335px 容器。修法是显式 `grid-cols-1` + 子项 `min-w-0`，没有用 `overflow-x: hidden` 掩盖。
  - 首版把 16:10 截图占位放在 1200px 容器里，桌面端撑成 1150×719 的空白块，正文被推到一屏外。改为截图与正文同列（≤720），缺图时收成一条虚线横条。
  - 移动端 MetaBar 折行后行首残留分隔点「·」，改为 `sm` 以下隐藏分隔符、用间距区分。
  - `pnpm lint` 被 `next-env.d.ts` 里的三斜杠引用卡住（Next 15.5 构建生成）。该文件由构建产出、不该手改，加进 eslint ignores。
- 范围补充：`alternatives` 卡片已实现，但三条内容的 `alternatives` 都是空数组，按设计整块隐藏。为证明渲染路径不是死代码，临时把 cal-com 的 `alternatives` 改成 `[n8n, uptime-kuma]` 重新构建，页面出现「站内替代品」段与两张卡片链接；验完 md5 校验还原（`fa79e16f…`）。
