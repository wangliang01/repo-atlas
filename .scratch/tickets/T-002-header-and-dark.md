# [T-002] 顶部导航固定在 56px，滚动后有下边线，能切暗色且不白闪

- **Status**: Done
- **Depends On**: T-001
- **预估轮数**: 6
- **Target Files**:
  - `components/site-header.tsx`、`components/theme-toggle.tsx`
  - `app/layout.tsx`、`app/globals.css`

## 要解决的问题

导航和暗色是全站外壳。晚做会导致每个页面各写一遍 header。白闪一旦出现，后面很难查。

## 范围

- 做：56px sticky header（左 logo、中导航、右 ⌘K 占位 + 暗色切换）；滚动后加 1px 下边线 + 背景变化；`prefers-color-scheme` 跟随 + `localStorage` 覆盖；`<html>` 上内联脚本在首次绘制前写入 `class="dark"`；页脚（版权 + 一句主张）。
- 不做：真正的搜索面板（P2）、移动端抽屉菜单以外的交互（汉堡菜单只做展开收起）。

> 裁判在 T-001 留下的两条待办，归本 Ticket 处理：`<html>` 需加 `suppressHydrationWarning`（否则主题脚本改 class 会触发 hydration 警告）；`.dark` 里要补 `color-scheme: dark`（否则原生滚动条、表单控件仍是亮色）。

## 验收标准（必须可执行）

- [x] AC-1：`pnpm typecheck` 与 `pnpm build` 均退出码 0
- [x] AC-2：`curl -s localhost:3000/ | grep -c 'position:sticky\|sticky'` ≥ 1，且 header 高度类为 `h-14`（56px）
- [x] AC-3：浏览器切到暗色后，`getComputedStyle(document.body).backgroundColor` 为 `rgb(18, 18, 17)`
- [x] AC-4：硬刷新（Ctrl+Shift+R）时无白色闪屏 —— 录屏或连续截图 3 帧说明
- [x] AC-5：暗色选择刷新后保留（`localStorage` 键存在且生效）
- [x] AC-6：375px 下 header 不换行、不溢出（`scrollWidth <= clientWidth` 为 `true`）

## 验证方式

```bash
pnpm typecheck && pnpm build          # 先停掉 dev，两者共用 .next
pnpm start --port 3100
curl -s localhost:3100/ | grep -oE 'class="[^"]*sticky[^"]*"' | head -1
# 浏览器侧（CDP 驱动 headless Chrome，见完成记录）
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test` → `tests 10 / pass 10 / fail 0`（新增 6 条：主题脚本、layout 注入、color-scheme、header/footer、切换按钮、移动端菜单；新增前 6 条中 5 绿 1 红）
  - `pnpm typecheck` 0；`pnpm lint components app lib` 0；`pnpm build` → `✓ Compiled successfully in 13.6s`，`┌ ○ /`（静态）
  - `curl localhost:3100/` → 200；`class="sticky top-0 z-40 h-14 border-b bg-bg ..."`；`aria-controls="mobile-nav"` 存在
  - CDP（生产构建，headless Chrome）实测：
    - 亮色 `body` 底色 `rgb(250, 249, 246)`；点切换后 `rgb(18, 18, 17)`，`localStorage["repo-atlas-theme"]="dark"`，`html.style.colorScheme="dark"` → AC-3
    - 硬刷新后底色仍为 `rgb(18, 18, 17)`、`aria-pressed="true"` → AC-5
    - **首帧探针**（document-start 注册 rAF，记录首个动画帧时 `<html>` 的底色与 class）：暗色刷新时 `{bg:"rgb(18, 18, 17)", cls:"... dark"}` → 首帧已是暗色，无亮色闪屏 → AC-4
    - 375×800：`scrollWidth 375 / clientWidth 375`、`headerHeight 56`、`headerOverflow false` → AC-6
    - 1440×900：`headerHeight 56`、`position sticky` → AC-2 补充
  - 截图：`1440-light.png` / `1440-dark.png` / `375-dark.png` / `375-menu.png`（临时目录，人工确认排版）
- 范围补充：移动端原来只有 logo 和切换按钮，无任何导航入口。按「汉堡菜单只做展开收起」补了 disclosure 面板（`aria-expanded` + `aria-controls`），未引入新依赖。
- 裁判后修复两条（均已实测）：
  - 双重 `<main>`（layout 一个、page 一个）→ 去掉 page 里的，`curl | grep -o '<main' | wc -l` = 1
  - `aria-controls` 指向未挂载元素 → 面板改为常驻 + `hidden` 属性，`<div id="mobile-nav" hidden` 出现在服务端 HTML
- 踩坑：`pnpm dev` 与 `pnpm build` 同时跑会写坏 `.next`（`next start` 报 `Cannot find module './880.js'`，页面 500）。已写入 AGENTS.md 工作流。
