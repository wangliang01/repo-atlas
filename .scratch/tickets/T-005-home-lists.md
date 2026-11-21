# [T-005] 首页能显示"本期 3 个 + 最新收录 8 条"，结论一眼可辨

- **Status**: Pending
- **Depends On**: T-004
- **预估轮数**: 8
- **Target Files**:
  - `components/project-card.tsx`、`components/project-row.tsx`
  - `components/verdict-badge.tsx`、`components/meta-bar.tsx`、`components/topic-chip.tsx`
  - `app/page.tsx`、`public/shots/`

## 要解决的问题

判断力是本项目唯一护城河，而判断力在视觉上就体现为 `VerdictBadge`。列表行的 72px 节奏决定整站"档案馆"气质。

## 范围

- 做：`VerdictBadge`（推荐=朱红实心 / 观望=灰描边 / 别碰=灰 + 删除线）；`MetaBar`（Star · 语言 · 部署 · 上手 · 协议 · 维护，等宽 12px）；`TopicChip`（1px 边框无底色）；`ProjectCard`（16:10 截图 + 定位 + 结论 + 上手时间）；`ProjectRow`（72px 行高，图标 40 / 标题 16 / 描述 14 / 元数据 12）；首页"本期"取最新 3 个、"最新收录"取 8 行；每行链到 `/projects/[slug]`。
- 不做：筛选排序、视图切换、主题入口、真实截图之外的美化（截图先放占位色块也可，但必须 16:10 且有 alt）。

> 裁判在 T-004 留下的三条，归本 Ticket 处理：
> 1. 现在只有 1 个项目，AC-2 写的「`/projects/` 链接 ≥ 3」跑不通。改成「链接数 = 项目数」，或先补到 3 个条目再按 3 验——开工前先定。
> 2. `public/shots/` 还不存在，`screenshot: /shots/cal-com.webp` 是死路径。本 Ticket 要么放真图，要么渲染 16:10 占位块并在 Ticket 里记下待替换。
> 3. `alternatives` 是强校验，新增条目必须先把被指向的 slug 建出来，否则构建失败。补内容时注意顺序。

## 验收标准（必须可执行）

- [ ] AC-1：`pnpm tsc --noEmit && pnpm build` 退出码 0
- [ ] AC-2：首页 HTML 中 `/projects/` 链接数量 ≥ 3
- [ ] AC-3：`ProjectRow` 实测行高 72px（`getBoundingClientRect().height` 在 71.5–72.5 之间）
- [ ] AC-4：三种 verdict 的渲染互不相同：别碰带 `line-through`，推荐底色为 `--accent`
- [ ] AC-5：`MetaBar` 6 项齐全，`font-variant-numeric` 计算值为 `tabular-nums`
- [ ] AC-6：375px 下卡片单列、列表行不溢出（`scrollWidth <= clientWidth` 为 `true`）
- [ ] AC-7：所有截图 `alt` 非空

## 验证方式

```bash
pnpm build && pnpm dev
curl -s localhost:3000/ | grep -o '/projects/[a-z-]*' | sort -u | wc -l
# 浏览器：量一行的高度、看三种 badge
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
