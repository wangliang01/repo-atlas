# [T-003] 首屏能读出"我是谁、我在做什么、最近更新"，没有内容时也不空白

- **Status**: Done
- **Depends On**: T-002
- **预估轮数**: 5
- **Target Files**:
  - `components/statement.tsx`、`components/section-head.tsx`
  - `app/page.tsx`

## 要解决的问题

10 秒测试全靠这一屏。没有内容时如果显示空白页，第一次部署就等于自我否定。

## 范围

- 做：`Statement`（主张 40px 宋体 + 两行灰色说明 + 一条 1px 分隔线 + `本期 · No.001` 与 `YYYY.MM.DD` 等宽小字）；区块标题组件（标题 + 右侧"全部 →"）；内容为空时显示"第一期正在写"占位块；页脚已由 T-002 提供。
- 不做：本期卡片与列表（T-005 才有数据）、主题入口（P2）。

## 验收标准（必须可执行）

- [x] AC-1：`pnpm build` 退出码 0
- [x] AC-2：`curl -s localhost:3000/ | grep -c '把值得读的开源项目，拆开看。'` ≥ 1
- [x] AC-3：`curl -s localhost:3000/ | grep -Eo '[0-9]{4}\.[0-9]{2}\.[0-9]{2}' | head -1` 有输出（首屏有日期）
- [x] AC-4：主张字号计算值 40px、行高 48px（`getComputedStyle` 断言）
- [x] AC-5：内容为空时页面含"第一期正在写"且无空白区域 > 400px
- [x] AC-6：首屏高度 ≤ 900px（1440×900 视口下主张 + 日期可见，不需要滚动）

## 验证方式

```bash
pnpm typecheck && pnpm build && pnpm start --port 3100
curl -s localhost:3100/ | grep -c '把值得读的开源项目，拆开看。'
curl -s localhost:3100/ | grep -Eo '[0-9]{4}\.[0-9]{2}\.[0-9]{2}' | head -1
# 浏览器：量 [data-testid=statement] 里 h1 的字号行高、time 的 bottom 是否 ≤ 900
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test` → `tests 14 / pass 14 / fail 0`（新增 4 条：日期格式、主张区结构、空状态、首页组装；新增时 4 条全红）
  - `pnpm typecheck` 0；`pnpm lint components app lib` 0；`pnpm build` → `✓ Compiled successfully`，`┌ ○ /`（静态）
  - `curl` → 200；主张文案 1 处；日期 `2026.11.21`；`第一期正在写` 1 处
  - CDP 1440×900：h1 `fontSize 40px` / `lineHeight 48px` / `fontFamily "Noto Serif SC"` → AC-4；`time` bottom `338` ≤ 900、`needScrollForStatement false`、`scrollHeight 900` → AC-6
  - CDP 375×800：同字号行高；`scrollWidth 375 = clientWidth 375`；空状态块高 `157`（桌面 `138`），相邻间隙最大 `96` → 无 > 400px 空白 → AC-5
  - 截图：`1440-light.png` / `375-dark.png`（临时目录，人工确认层级与对齐）
- 偏离：`components/section-head.tsx` 未创建。首页目前只有"本期"一行元数据，没有"标题 + 全部 →"的列表区；建了也是死代码，留到 T-005 与列表一起做（裁判复核：全仓无引用，偏离合理）。
- 遗留（非阻断）：375px 下 40px 标题把"项目"拆成两行（CJK 断词），未做处理，T-008 移动端收口时一并看。
