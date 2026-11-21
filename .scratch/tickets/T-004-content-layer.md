# [T-004] 写错一个字段构建就失败，读内容只有一个入口

- **Status**: Pending
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

## 验收标准（必须可执行）

- [ ] AC-1：`node --test lib/schema.test.ts` 输出 `pass 3` 且 `fail 0`
- [ ] AC-2：`pnpm tsc --noEmit` 退出码 0
- [ ] AC-3：删掉 `content/projects/cal-com.mdx` 的 `verdict` 字段后 `pnpm build` **失败**，报错含字段名 `verdict`（验完恢复）
- [ ] AC-4：把 `verdict` 改成 `maybe` 后 `pnpm build` 失败，报错含允许值列表
- [ ] AC-5：`alternatives` 写一个不存在的 slug 时构建失败
- [ ] AC-6：`getAllProjects()` 返回数组长度等于 `content/projects/*.mdx` 文件数

## 验证方式

```bash
node --test lib/schema.test.ts
pnpm tsc --noEmit && pnpm build
# 破坏性验证：注释掉一个必填字段 → pnpm build 必须非 0 退出
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
