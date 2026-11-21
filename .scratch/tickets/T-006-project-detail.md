# [T-006] 随便点开一个项目，60 秒内能读到一句明确的判断

- **Status**: Pending
- **Depends On**: T-005
- **预估轮数**: 8
- **Target Files**:
  - `app/projects/[slug]/page.tsx`
  - `components/prose.tsx`（项目正文复用）
  - `lib/content.ts`（补 `getAdjacentProjects`）

## 要解决的问题

项目页是转化页。README 翻译在这里会立刻被识破，所以模板的六段结构必须被强制出来，不能靠记忆。

## 范围

- 做：`generateStaticParams` 全量预渲染 + `generateMetadata`（title/description 用 `name` + `tagline`）；面包屑；h1 + `VerdictBadge`；`tagline`；`MetaBar`；16:10 截图；MDX 正文按六段式渲染；`alternatives` 渲染为 2–3 张站内卡片（不存在则整块隐藏）；上一篇/下一篇；≥1280px 右侧吸顶栏显示"最后核实于 {publishedAt}"。
- 不做：Toc（项目页内容短，T-007 再实现）、评论区、分享按钮。

## 验收标准（必须可执行）

- [ ] AC-1：`pnpm build` 路由表出现 `/projects/[slug]` 且标记为静态（`●`/`○`，非 `ƒ`）
- [ ] AC-2：`curl -s localhost:3000/projects/cal-com | grep -c '我的判断'` ≥ 1，且"它是什么/技术看点/怎么上手/边界/替代品"同样各 ≥ 1（六段齐全）
- [ ] AC-3：页面 HTML 含 `publishedAt` 对应的 `YYYY.MM.DD`
- [ ] AC-4：不存在的 slug 返回 404（`curl -o /dev/null -w "%{http_code}"` 为 404）
- [ ] AC-5：`<title>` 含项目名，`<meta name="description">` 非空
- [ ] AC-6：上一篇/下一篇链接至少有一个非空（单条目时允许两者都指向列表页）
- [ ] AC-7：375px 无横向滚动，正文列宽 ≤ 720px（1440px 下实测）

## 验证方式

```bash
pnpm build && pnpm dev
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/projects/cal-com
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/projects/not-exist
curl -s localhost:3000/projects/cal-com | grep -c '我的判断'
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
