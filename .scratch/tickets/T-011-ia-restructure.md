# [T-011] 信息架构重构：导航收成三项，三页统一三栏

- **Status**: Done
- **Depends On**: T-010（精选有真实数据可筛）
- **Target Files**:
  - `components/site-shell.tsx`、`lib/layout.ts`（三栏壳与宽度常量）
  - `components/rail-list.tsx`、`components/verdict-legend.tsx`、`components/home-rail.tsx`
  - `components/profile-card.tsx`、`lib/profile.ts`
  - `components/picks-view.tsx`、`components/pick-row.tsx`（删 `pick-list.tsx`）
  - `components/project-lead.tsx`（删 `project-card.tsx`）
  - `app/page.tsx`、`app/picks/page.tsx`、`app/notes/page.tsx`、`components/site-header.tsx`
  - `app/projects/page.tsx`（删除）、`next.config.ts`（308）

## 要解决的问题

三件事叠在一起，都是"访客第一眼看不懂这个站在干什么"：

1. **导航有五个名字指同一个东西**：雷达、精选、项目库、跑过的、本期。其中「雷达」没有任何人看得懂——它其实只是"从 GitHub 抓来的 AI 项目列表"，和「精选」是同一批内容。
2. **首页和精选功能重叠**：`n8n` 同时出现在 `content/projects/n8n.mdx` 和 `content/picks/ai.mdx`，两处星数还不一样（150k vs 211.7k）；精选条目只链到 github.com，站内的六段评测反而没入口。
3. **版式没有性格**：首页是"标题 + 三张大卡"，1440 首屏只放得下三张，第二行还空一格；精选是一列到底，右边一大片空白。

## 范围

- 做：
  - 导航固定三项：**首页 `/` / 精选 `/picks` / 笔记 `/notes`**；`/projects` 列表页删除，308 到 `/`；项目详情仍是 `/projects/[slug]`。
  - 三页共用 `SiteShell` 三栏：左索引 / 中 feed / 右个人信息。`md` 出左栏、`xl` 出右栏，更窄时右栏降级成 feed 末尾的 `ShellStrip`。
  - 精选把「分类」和「涨得快」拆成两个轴：左栏是分类（带条数），feed 顶部是一个 `aria-pressed` 开关。
  - 首页「本期」从占位截图卡改成一行的 `ProjectLead`（序号 + 结论 + 一句话 + 上手时间/语言/协议 + 星数）。
  - 右栏 `ProfileCard`：头像 / 名字 / 一句话 / GitHub / 邮箱 / 状态·城市·技术栈；没填的字段不渲染。
- 不做：搜索、标签页、分页、个人主页 `/about`、动态路由。

## 关键决定

- **`/projects` 用 308 而不是 404**：这个地址在 T-008 的验收里是 200，可能已经被记在别处；308 保住了旧链接，又不用维护一个和首页重复的列表页。
- **三栏只在 `xl` 出右栏**：1200 容器扣掉 200 + 280 + 2×40 后 feed 只剩 592，正好是掘金那种"一行放得下标题 + 两行简介 + 一行元信息"的宽度。1024 强塞三栏会把 feed 压到 400 出头，反而更难看。
- **aside 不能 `self-start`**：栅格默认 stretch，aside 撑到整行高，里面的 `sticky` 才有行程。加 `self-start` 会让 aside 收缩到内容高度，sticky 静默失效（实测滚 600px 后 `top = -351`）。这条写进了 `lib/layout.test.ts`，防止以后有人"优化"回去。
- **分类和涨速是两个轴，不是一个 tab 列表**：原来的 8 个 tab 里混了「全部 / 涨得快 / 高星 / Agent / Skill / MCP / 模型 / 工具」，前三个是排序、后五个是分类，点「Agent」再想"只看涨得快"就做不到了。拆开后 `filterPicks` 收一个 `{ category, risingOnly }`，两个维度可以叠加。
- **「涨得快」改成排名前 10**：固定阈值（比如 500/天）在 26 条里命中 26 条，等于没筛。
- **`role="tab"` 换成 `role="group"` + `aria-pressed`**：9 个 tab 配 0 个 `tabpanel`，键盘和读屏都对不上。分类是筛选按钮，不是标签页。
- **不编造个人信息**：`PROFILE` 是空对象，`visibleProfileFields` 过滤空值和非法 href，`ProfileCard` 回落到站点名与主张，绝不显示「未填写」。

## 验收标准（必须可执行）

- [x] AC-1：导航恰好三项（首页 / 精选 / 笔记），当前项带 `aria-current="page"`
- [x] AC-2：`/projects` 返回 308 且 `location: /`；`app/projects/page.tsx` 不存在
- [x] AC-3：三页在 1440 / 1280 下三栏宽度为 200 / 592 / 280；1024 为 160 / 784；768 为 160 / 528；375 为单栏 335
- [x] AC-4：3 路由 × 5 档宽度，`scrollWidth - clientWidth === 0`
- [x] AC-5：滚 600px 后左右栏 `top === 72`（sticky 生效）
- [x] AC-6：精选筛选叠加正确：全部 26 → 只看涨得快 10 → Agent+涨得快 6 → MCP+涨得快 1 → 只 MCP 3
- [x] AC-7：`document.querySelectorAll('[role="tab"]').length === 0`，`aria-pressed` 跟随，`aria-live` 报出条数
- [x] AC-8：`pnpm build` 全部路由为 `○` / `●`，无 `ƒ`
- [x] AC-9：`node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm check:alt` 通过

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：CDP 读 `header nav a`，3 项；`/` 上「首页」`aria-current=page`、颜色 `rgb(26,25,23)`，另两项 `rgb(110,106,99)`；`/picks`、`/notes` 同样跟随
  - AC-2：`curl -D -` → `HTTP/1.1 308 Permanent Redirect` / `location: /`
  - AC-3：`1440/1280 → 200 / 592 / 280`、`1024 → 160 / 784`、`768 → 160 / 528`、`375 → 335`（3 路由全测）
  - AC-4：15 组全为 `溢出 0`
  - AC-5：`{"railTop":72,"rightTop":72}`
  - AC-6：`{"all":26,"rising":10,"agentRising":6,"mcpRising":1,"mcpOnly":3}`
  - AC-7：`tabs: 0`；`aria-pressed` 依次 `true/true/true`，切到 MCP 后 Agent 变 `false`；`aria-live` 文本 `6 个`
  - AC-8：10 页全 `○` / `●`
  - AC-9：`node --test` 73/73；typecheck 0；lint 0 error；`26 张图，全部有 alt 属性；其中 26 张标为装饰（alt=""）`
  - 截图：1440 / 375 × 首页 / 精选 / 笔记 共六张，交付前逐张看过（探针脚本是临时的，不留在仓库里）
- 实现说明：
  - 栅格 className 必须是字面量：Tailwind v4 只扫源码里的完整类名，`grid-cols-[${n}px...]` 永远生成不出 CSS。宽度常量另存 `lib/layout.ts` 给测试用。
  - `lib/layout.test.ts` 里同时锁两件事：模板字符串里的像素值和常量一致；aside 的开标签上不能出现 `self-start`（只查开标签，注释里提到这个词是允许的）。
  - 首页首屏原来三个 `NO.01` 空框看着像图挂了，改成 `ProjectLead` 后首屏能放下 3 行本期 + 「最近在扫」3 条。
  - `formatStars` 原来有两份（`lib/format.ts` 取整、`lib/picks.ts` 保留一位），首页显示 32k、精选显示 32.0k。现在只留 `lib/format.ts` 一份，`lib/format.test.ts` 锁住 `picks.ts` 里不再出现第二份。
  - `check-alt` 以前把 `alt=""` 判成失败，而装饰图正确的写法就是空 alt。现在空 alt 单独计数，只有缺属性才失败。
- 已知取舍：
  - `lib/profile.ts` 的 `PROFILE` 是空的，右栏现在只显示站点名与主张。填上真实字段即可，空字段不会渲染。
  - 精选左栏分类的条数之和大于 26：一条项目可以有多个 topic，会同时落进多个分类。这是分类本身的性质，不是计数错误。
  - 笔记页左栏在 `md` 以下隐藏：手机上竖排会把「工具 1」压在正文的「工具」标题上方，同一句话读两遍。
