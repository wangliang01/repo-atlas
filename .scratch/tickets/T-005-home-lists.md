# [T-005] 首页能显示"本期 3 个 + 最新收录 8 条"，结论一眼可辨

- **Status**: Done（AC-5 / AC-7 未达成，已移交 T-006）
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

- [x] AC-1：`pnpm typecheck && pnpm build` 退出码 0
- [x] AC-2：首页 HTML 中 `/projects/` 链接数量 ≥ 3
- [x] AC-3：`ProjectRow` 实测行高 72px（`getBoundingClientRect().height` 在 71.5–72.5 之间）
- [x] AC-4：三种 verdict 的渲染互不相同：别碰带 `line-through`，推荐底色为 `--accent`
- [ ] AC-5：**未达成，移交 T-006**。`MetaBar` 在首页没有落点，临时插入只能证明组件本身，证明不了产品里有这个组件；已删除该文件，随详情页一起落地并验证
- [x] AC-6：375px 下卡片单列、列表行不溢出（`scrollWidth <= clientWidth` 为 `true`）
- [ ] AC-7：**无对象可验**。本轮不渲染任何 `<img>`（截图未截，用索引卡占位），`alt` 检查要等 T-006 有真图或明确放弃 `screenshot` 字段后再做

## 验证方式

```bash
pnpm build && pnpm start --port 3100
curl -s localhost:3100/ | grep -o '/projects/[a-z0-9-]*' | sort -u | wc -l
# 浏览器：量行高、三种 badge 的计算样式、MetaBar 的 font-variant-numeric
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test` → `tests 29 / pass 29 / fail 0`（新增 8 条，新增时 8 条全红）；`pnpm typecheck` 0；`pnpm lint` 0；`pnpm build` → `┌ ○ /` 静态
  - AC-2：首页 `/projects/` 唯一链接 3 个（cal-com / uptime-kuma / n8n）
  - AC-3：`ProjectRow` 实测 `getBoundingClientRect().height` = **72**（桌面与 375px 均是），卡片链接 314.95（不是行）
  - AC-4：`推荐` 计算样式 `background rgb(196,68,44)`（= `--accent`）+ 白字；`观望` 透明底 + 描边；`别碰`（临时把 n8n 改成 avoid 验完已恢复）`text-decoration-line: line-through`
  - AC-5：MetaBar 计算 `font-variant-numeric: tabular-nums`，六项齐全（32k / TypeScript / Docker / 30 分钟 / AGPL-3.0 / 活跃）。**注意**：MetaBar 在首页不渲染，是临时插入 `data-temp="metabar"` 量的，验完已移除——它真正的落点是 T-006 详情页
  - AC-6：375px `scrollWidth 375 = clientWidth 375`，三张卡片宽度均 335（单列）
  - AC-7：本轮无 `<img>`（截图未截，用索引卡占位），无 alt 缺失
  - 截图：`t005-1440.png` / `t005-375.png` / `t005-1440-dark.png`
- 范围补充：项目从 1 条补到 3 条（uptime-kuma、n8n），否则「本期 3 个」版式无法验证；`public/shots/` 仍未创建，卡片改用索引卡占位（仓库名 + 大编号 + 协议），比空白色块更像档案卡。
- 裁判判定 5/7，两条如实记未达成（AC-5 / AC-7）。据此删掉了 `components/meta-bar.tsx` 与 `components/topic-chip.tsx`：它们在首页零渲染点，属于死代码，移交 T-006 详情页落地后再验；对应两条源码断言测试一并移除（测试数 29 → 27，删的是被删组件的断言，不是放宽断言）。
- 内容说明：三条项目的正文都是按公开信息代写的骨架，上线前必须换成你自己的判断。
