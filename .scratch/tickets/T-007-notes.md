# [T-007] 笔记读起来像纸，代码块带文件名和复制，末尾敢承认没搞懂

- **Status**: Pending
- **Depends On**: T-004, T-002
- **预估轮数**: 9
- **Target Files**:
  - `app/notes/page.tsx`、`app/notes/[slug]/page.tsx`
  - `components/prose.tsx`、`components/toc.tsx`、`components/code-block.tsx`
  - `components/note-card.tsx`、`content/notes/why-mdx.mdx`

## 要解决的问题

笔记是深度证据。排版一垮，20 分钟耐看这条就过不了；"我还没搞懂的部分"是诚实度的唯一可见证明。

## 范围

- 做：`/notes` 列表（`NoteCard`：日期 + 标题 + 摘要 + 阅读时长）；`/notes/[slug]` 正文 720px；`Prose` 覆盖 h2/h3、p、ul/ol、blockquote、table、figure+figcaption；Shiki 构建时高亮 + 文件名标签 + 复制按钮 + 可选行号；`Toc` ≥1280px 吸顶、按 h2/h3 生成、当前节高亮；文末固定渲染"我还没搞懂的部分"小节；`generateStaticParams` + `generateMetadata`。
- 不做：系列导航（条目不足）、脚注（P1）、图片灯箱。

## 验收标准（必须可执行）

- [ ] AC-1：`pnpm build` 路由表含 `/notes` 与 `/notes/[slug]`，均为静态
- [ ] AC-2：`curl -s localhost:3000/notes/why-mdx | grep -c '我还没搞懂的部分'` ≥ 1
- [ ] AC-3：代码块渲染出 `<pre>` 且带 `data-language`，无运行时高亮库（`grep -r "prism\|highlight.js" package.json` 无输出）
- [ ] AC-4：复制按钮点击后 `navigator.clipboard.readText()` 等于代码原文（手动验证一次并记录）
- [ ] AC-5：1440px 下 Toc 可见且 `position: sticky`；1024px 下不可见
- [ ] AC-6：正文列宽 720px（±1px），行高 28px（16 × 1.75）
- [ ] AC-7：375px 下代码块横向可滚但不撑破页面（`document.documentElement.scrollWidth <= clientWidth` 为 `true`）
- [ ] AC-8：笔记页 `<title>` 含笔记标题

## 验证方式

```bash
pnpm build && pnpm dev
curl -s localhost:3000/notes/why-mdx | grep -c '我还没搞懂的部分'
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/notes/why-mdx
# 浏览器：点复制 → 粘贴比对；缩到 1024 看 Toc 消失
```

## 完成记录

- 提交：
- 证据（输出 / 截图 / 响应）：
