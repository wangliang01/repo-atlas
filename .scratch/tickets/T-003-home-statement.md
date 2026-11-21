# [T-003] 首屏能读出"我是谁、我在做什么、最近更新"，没有内容时也不空白

- **Status**: Pending
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

- [ ] AC-1：`pnpm build` 退出码 0
- [ ] AC-2：`curl -s localhost:3000/ | grep -c '把值得读的开源项目，拆开看。'` ≥ 1
- [ ] AC-3：`curl -s localhost:3000/ | grep -Eo '[0-9]{4}\.[0-9]{2}\.[0-9]{2}' | head -1` 有输出（首屏有日期）
- [ ] AC-4：主张字号计算值 40px、行高 48px（`getComputedStyle` 断言）
- [ ] AC-5：内容为空时页面含"第一期正在写"且无空白区域 > 400px
- [ ] AC-6：首屏高度 ≤ 900px（1440×900 视口下主张 + 日期可见，不需要滚动）

## 验证方式

```bash
pnpm build && pnpm dev
curl -s localhost:3000/ | grep -c '把值得读的开源项目，拆开看。'
# 浏览器 1440x900：document.querySelector('[data-testid=statement]').getBoundingClientRect()
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
