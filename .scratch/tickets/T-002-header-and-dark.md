# [T-002] 顶部导航固定在 56px，滚动后有下边线，能切暗色且不白闪

- **Status**: Pending
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

## 验收标准（必须可执行）

- [ ] AC-1：`pnpm tsc --noEmit` 与 `pnpm build` 均退出码 0
- [ ] AC-2：`curl -s localhost:3000/ | grep -c 'position:sticky\|sticky'` ≥ 1，且 header 高度类为 `h-14`（56px）
- [ ] AC-3：浏览器切到暗色后，`getComputedStyle(document.body).backgroundColor` 为 `rgb(18, 18, 17)`
- [ ] AC-4：硬刷新（Ctrl+Shift+R）时无白色闪屏 —— 录屏或连续截图 3 帧说明
- [ ] AC-5：暗色选择刷新后保留（`localStorage` 键存在且生效）
- [ ] AC-6：375px 下 header 不换行、不溢出（`scrollWidth <= clientWidth` 为 `true`）

## 验证方式

```bash
pnpm tsc --noEmit && pnpm build
pnpm dev
# 浏览器：切暗色 → 刷新 → 控制台断言
# getComputedStyle(document.body).backgroundColor
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
