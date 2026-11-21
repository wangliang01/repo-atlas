# [T-004] 写错一个字段构建就失败，读内容只有一个入口

- **Status**: Done
- **Depends On**: T-001
- **预估轮数**: 8
- **Target Files**:
  - `lib/schema.ts`、`lib/content.ts`、`lib/schema.test.ts`
  - `content/projects/cal-com.mdx`、`content/notes/why-mdx.mdx`
  - `package.json`（`gray-matter`、`zod`、`next-mdx-remote` 或 `@next/mdx`）

## 要解决的问题

字段是本站真正的设计产物（面试会问）。没有校验，一个错字会让页面静默渲染成空白。所有页面都必须只通过 `lib/content.ts` 读数据，否则字段会各处硬编码。

## 范围

- 做：`schema.ts` 用 Zod 定义 SPEC 2.3 全部字段与枚举；`content.ts` 导出 `getAllProjects()` / `getProject(slug)` / `getAllNotes()` / `getNote(slug)`，构建时读文件、`matter` 解析、`schema.parse` 失败即抛错；`alternatives` 校验指向的 slug 必须存在；1 个项目 + 1 篇笔记样例（可用 Cal.com 真实数据，正文各 200 字以上）；`node --test` 跑通 3 条单测。
- 不做：页面渲染（T-005 起）、搜索索引、`projects.json` 生成。

> 裁判在 T-003 留下的三条，归本 Ticket 处理：
> 1. 首页 `updatedAt` 现在是 `new Date()`（构建时间），只能证明"刚部署过"。改成 `max(publishedAt)`，无内容时才退回构建日。
> 2. `new Date("2026-11-20")` 按 UTC 解析，而 `lib/date.ts` 用本地 `getDate()`，跨时区会差一天。解析纯日期字符串要按本地时区构造（`new Date(y, m-1, d)`）。
> 3. `No.001` 与空状态目前硬编码在 `app/page.tsx`，期号应由条目数推导（如 `Math.ceil(count / 3)`）。

## 验收标准（必须可执行）

- [x] AC-1：`node --test lib/schema.test.ts` → pass 7 / fail 0（要求 ≥3）
- [x] AC-2：`pnpm tsc --noEmit` 退出码 0
- [x] AC-3：删掉 `content/projects/cal-com.mdx` 的 `verdict` 字段后 `pnpm build` **失败**，报错含字段名 `verdict`（验完恢复）
- [x] AC-4：把 `verdict` 改成 `maybe` 后 `pnpm build` 失败，报错含允许值列表
- [x] AC-5：`alternatives` 写一个不存在的 slug 时构建失败
- [x] AC-6：`getAllProjects()` 返回数组长度等于 `content/projects/*.mdx` 文件数

## 验证方式

```bash
node --test lib/schema.test.ts
pnpm typecheck && pnpm build
# 破坏性验证（脚本化，验完恢复并比对 md5）：
#   1) 删掉 verdict 行      → build 必须非 0，报错含 verdict
#   2) verdict: maybe       → build 必须非 0，报错列出允许值
#   3) alternatives: [x]    → build 必须非 0，报错含 x
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test lib/schema.test.ts` → `tests 7 / pass 7 / fail 0`（AC-1 要求 ≥3 且 0 失败）；全仓 `node --test` → `21 / 21`
  - `pnpm typecheck` 0；`pnpm lint components app lib` 0；`pnpm build` → `✓ Compiled successfully`，`┌ ○ /`（静态）
  - AC-3：删掉 `verdict` 行 → `Error: content/projects/cal-com.mdx 校验失败：- verdict: Required`，exit 1
  - AC-4：`verdict: maybe` → `- verdict: Invalid enum value. Expected 'recommend' | 'watch' | 'avoid', received 'maybe'`，exit 1
  - AC-5：`alternatives: [not-exist]` → `Error: alternatives 指向不存在的条目：cal-com → not-exist`，exit 1
  - 三次破坏性验证后 `md5sum` 与备份一致（`54ebe5ad…`），文件已恢复
  - AC-6：`ls content/projects/*.mdx | wc -l` = 1，`getAllProjects().length` = 1
  - 首页日期由 `2026.11.21`（构建日）变为 `2026.11.20`（`max(publishedAt)`），期号渲染为 `本期 · No.001` → 裁判遗留 #1、#3 已落地
- 偏离：
  - 未安装 `next-mdx-remote` / `@next/mdx`：T-004 只做数据层，渲染在 T-006 才需要，装了就是死依赖。
  - `tsconfig` 加 `allowImportingTsExtensions`：Node 跑 `.ts` 测试必须带扩展名，否则 tsc 报 TS5097。
  - 首页目前是**中间态**：只有主张区，1 个项目不渲染任何列表（列表属 T-005）。不要在这个提交上部署。
- 内容说明：`content/**` 两份样例是我按公开信息代写的骨架，**上线前必须换成你自己的判断**（尤其"我的判断"与"我还没搞懂的部分"两节）。
