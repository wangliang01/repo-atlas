# [T-001] 项目能启动，且底色、字体、容器宽度已经是设计稿的样子

- **Status**: Done
- **Depends On**: 无
- **预估轮数**: 8
- **Target Files**:
  - `package.json`、`tsconfig.json`、`next.config.ts`、`postcss.config.mjs`
  - `app/layout.tsx`、`app/globals.css`、`app/page.tsx`
  - `.gitignore`

## 要解决的问题

没有骨架，后面所有 Ticket 都无处落。设计 token 必须先定死，否则每个页面都会自己造颜色和字号。

## 范围

- 做：`create-next-app`（App Router / TS / Tailwind / 无 src 目录 / import alias `@/*`）；`globals.css` 写入 SPEC 的 7 个颜色 token + 五档字号 + 间距变量；`next/font` 接入 Inter + JetBrains Mono + Noto Sans SC + Noto Serif SC；`layout.tsx` 提供 `<html lang="zh-CN">` 与容器；首页先放一句占位主张。
- 不做：任何导航、列表、内容读取、暗色切换（T-002 起）。

## 验收标准（必须可执行）

- [x] AC-1：`pnpm install` 退出码 0
- [x] AC-2：`pnpm tsc --noEmit` 退出码 0
- [x] AC-3：`pnpm build` 成功，路由表出现 `/`（标记 `○ Static`）
- [x] AC-4：`pnpm dev` 后取页面引用的样式表并 grep：`FAF9F6` 出现 ≥ 1
      （原 AC 写成 grep HTML，实际 Next 把 CSS 放在 `/_next/static/css/app/layout.css`，已修正为真实可执行的写法）
- [x] AC-5：四个字体族均被声明，且 `layout.tsx` 用 `next/font` 加载（由 `lib/tokens.test.ts` 断言）
- [x] AC-6：`tsconfig.json` 含 `"strict": true`
- [x] AC-7：`.gitignore` 含 `node_modules`、`.next`、`decisions.tsv`

## 验证方式

```bash
pnpm install && pnpm tsc --noEmit && pnpm build
node --test lib/tokens.test.ts
pnpm dev --port 3100
CSS=$(curl -s localhost:3100/ | grep -oE 'href="/_next/static/css/[^"]+"' | head -1 | sed 's/href="//;s/"$//')
curl -s "localhost:3100$CSS" | grep -c 'FAF9F6'
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test lib/tokens.test.ts` → `tests 4 / pass 4 / fail 0`（红灯阶段同样 4 条全红，ENOENT，exit 1）
  - `pnpm tsc --noEmit` → exit 0；`pnpm lint app/page.tsx app/layout.tsx lib/tokens.test.ts` → exit 0
  - `pnpm build` → `✓ Compiled successfully in 11.6s`；`┌ ○ /  123 B  103 kB`；`○ (Static)`
  - `curl localhost:3100/` → `HTTP: 200`；样式表含 `--text-display: 40px`、`--container: 1200px`、`FAF9F6` 各 1 处
  - 编译产物含 `.text-display { font-size: var(--text-display); }` 与 `.wrap { max-width: var(--container) }`
- 偏离说明：额外引入 `eslint.config.mjs`（`eslint` 9 flat config + `eslint-config-next`），否则 AGENTS.md 承诺的 `pnpm lint` 跑不起来；未新增 SPEC 之外的功能依赖。
