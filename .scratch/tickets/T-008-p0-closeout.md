# [T-008] P0 收口：手机上不横滚、图片都有 alt、错路径不白屏

- **Status**: Pending
- **Depends On**: T-006, T-007
- **预估轮数**: 5
- **Target Files**:
  - `app/not-found.tsx`
  - `app/globals.css`（仅在验收发现溢出时改）

## 要解决的问题

P0 的验收锚点是"本地可跑 + 三页可达 + 375px 不横滚"。前 7 个 Ticket 各自只管自己那页，没有一次性通检，溢出和缺失 alt 一定会漏。

## 范围

- 做：`not-found.tsx`（一句说明 + 返回首页 + 搜索入口占位，不接 Pagefind）；逐页跑 AC-4 / AC-8；修掉所有横向溢出（优先改 padding/宽度，不改字号）；按 SPEC 第 12 节五条自检打分并记录。
- 不做：Lighthouse 跑分（P4）、404 搜索框真实可用（P2）、动效打磨（P4）。

## 验收标准（必须可执行）

- [ ] AC-1：`pnpm tsc --noEmit && pnpm build` 退出码 0
- [ ] AC-2：三页 375px 与 1440px 下控制台断言 `scrollWidth <= clientWidth` 均为 `true`（8 次，记录结果表）
- [ ] AC-3：`grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"'` 无输出
- [ ] AC-4：`curl -s -o /dev/null -w "%{http_code}" localhost:3000/nope` 为 404，且页面含"返回首页"链接
- [ ] AC-5：外链均带 `rel="noopener"`：`grep -r 'target="_blank"' app components | grep -v noopener` 无输出
- [ ] AC-6：SPEC 第 12 节五条自检 ≥ 3 条通过，并把结果写进 `PROGRESS.md`

## 验证方式

```bash
pnpm build && pnpm dev
for p in / /projects/cal-com /notes/why-mdx /nope; do
  echo -n "$p "; curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000$p"
done
grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"' || echo "alt ok"
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
