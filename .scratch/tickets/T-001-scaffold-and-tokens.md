# [T-001] 项目能启动，且底色、字体、容器宽度已经是设计稿的样子

- **Status**: Pending
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

- [ ] AC-1：`pnpm install` 退出码 0
- [ ] AC-2：`pnpm tsc --noEmit` 退出码 0
- [ ] AC-3：`pnpm build` 成功，路由表出现 `/`
- [ ] AC-4：`pnpm dev` 后 `curl -s localhost:3000/ | grep -c 'FAF9F6'` ≥ 1（token 已注入）
- [ ] AC-5：`grep -c 'font-family' app/globals.css` 中四个字体族均被声明，且 `layout.tsx` 用 `next/font` 加载
- [ ] AC-6：`tsconfig.json` 含 `"strict": true`
- [ ] AC-7：`.gitignore` 含 `node_modules`、`.next`、`decisions.tsv`

## 验证方式

```bash
pnpm install && pnpm tsc --noEmit && pnpm build
pnpm dev &            # 另开一个终端更稳
curl -s localhost:3000/ | grep -o 'FAF9F6' | head -1
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
