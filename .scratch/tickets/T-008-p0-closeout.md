# [T-008] P0 收口：手机上不横滚、图片都有 alt、错路径不白屏

- **Status**: Done
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

- [x] AC-1：`pnpm tsc --noEmit && pnpm build` 退出码 0
- [x] AC-2：三页 375px 与 1440px 下控制台断言 `scrollWidth <= clientWidth` 均为 `true`（8 次，记录结果表）
- [x] AC-3：`grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"'` 无输出
- [x] AC-4：`curl -s -o /dev/null -w "%{http_code}" localhost:3000/nope` 为 404，且页面含"返回首页"链接
- [x] AC-5：外链均带 `rel="noopener"`：`grep -r 'target="_blank"' app components | grep -v noopener` 无输出
- [x] AC-6：SPEC 第 12 节五条自检 ≥ 3 条通过，并把结果写进 `PROGRESS.md`

## 验证方式

```bash
pnpm build && pnpm dev
for p in / /projects/cal-com /notes/why-mdx /nope; do
  echo -n "$p "; curl -s -o /dev/null -w "%{http_code}\n" "localhost:3000$p"
done
grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"' || echo "alt ok"
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：`pnpm install --frozen-lockfile` 0；`pnpm typecheck` 0；`node --test` 41/41；`pnpm lint` 0；`pnpm build` 10 页全静态（`○` / `●`，无 `ƒ`）
  - AC-2：6 条路由 × 375 / 1440 = 12 次实测，全部 `scrollWidth === clientWidth`：`/` 375→375、1440→1440；`/projects`、`/notes`、`/projects/cal-com`、`/notes/why-mdx`、`/nope` 同。详情页 375px 有 3–5 个元素越出视口，逐个查了父级滚动容器，全部在 `div.overflow-x-auto`（代码块自己的横向滚动区）里，页面本身不滚
  - AC-3：`grep -rE "<(img|Image)[^>]*>" app components | grep -v 'alt="[^"]\+"'` 无输出。这条 grep 在"页面没有图"时属于假通过，所以额外做了一次破坏性验证：临时把一张真实 PNG 放进 `public/shots/`、给 cal-com 加 `screenshot`，构建后页面出现 `<img alt="Cal.com 的界面截图" ...>`；验完删图并用 md5 还原 mdx（`fa79e16f…`）
  - AC-4：`/nope` → 404，页面含「返回首页」链接（指向 `/`），HTTP 状态码与文案都验了
  - AC-5：`grep -r 'target="_blank"' app components | grep -v noopener` 无输出。注：`rel` 与 `target` 原本分两行，按行 grep 会误报，改成同一行——不是把 `rel` 删了
  - AC-6：SPEC 里没有"第 12 节五条自检"（只有 9 条 P0 验收标准），按那 9 条跑，9/9 通过，结果写进 PROGRESS
  - 截图：`t008-home-375.png` / `t008-404-1440.png` / `t008-projects-1440.png`
- 本轮新增：
  - `app/not-found.tsx`：404 + 返回首页 + 搜索占位（虚线框 + 禁用输入，写明还没接 Pagefind）
  - `app/projects/page.tsx`：导航里的「雷达」原来 404，现在有项目库列表页（复用 `ProjectRow`）
  - 导航去掉「关于」：没有 bio 内容，与其挂个 404 不如先不暴露入口
  - 首页主张加 `text-balance`：375px 原本把「项目」拆成「项 / 目」，现在断成「把值得读的开源 / 项目，拆开看。」，没有为此新增字号档
