# [T-007] 笔记读起来像纸，代码块带文件名和复制，末尾敢承认没搞懂

- **Status**: Done
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

- [x] AC-1：`pnpm build` 路由表含 `/notes` 与 `/notes/[slug]`，均为静态
- [x] AC-2：`curl -s localhost:3000/notes/why-mdx | grep -c '我还没搞懂的部分'` ≥ 1
- [x] AC-3：代码块渲染出 `<pre>` 且带 `data-language`，无运行时高亮库（`grep -r "prism\|highlight.js" package.json` 无输出）
- [x] AC-4：复制按钮点击后 `navigator.clipboard.readText()` 等于代码原文（手动验证一次并记录）
- [x] AC-5：1440px 下 Toc 可见且 `position: sticky`；1024px 下不可见
- [x] AC-6：正文列宽 720px（±1px），行高 28px（16 × 1.75）
- [x] AC-7：375px 下代码块横向可滚但不撑破页面（`document.documentElement.scrollWidth <= clientWidth` 为 `true`）
- [x] AC-8：笔记页 `<title>` 含笔记标题

## 验证方式

```bash
pnpm build && pnpm dev
curl -s localhost:3000/notes/why-mdx | grep -c '我还没搞懂的部分'
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/notes/why-mdx
# 浏览器：点复制 → 粘贴比对；缩到 1024 看 Toc 消失
```

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - `node --test` 41/41（新增 10 条，写时全红）；`pnpm typecheck` 0；`pnpm lint` 0；`pnpm build` → `○ /notes`、`● /notes/[slug]`，共 9 页
  - AC-2：「我还没搞懂的部分」是独立的 `<h2 id="我还没搞懂的部分">`，由 `parseNoteSections` 从正文切出后固定渲染在末尾；缺这一节的笔记会让构建直接失败（有测试）
  - AC-3：`<pre data-language="ts" class="shiki ...">`；`.next/static/chunks` 里搜不到 shiki；`package.json` 无 prism / highlight.js
  - AC-4：CDP 点复制 → `data-copied="true"`，`navigator.clipboard.readText()` 返回与原文一致（Windows 剪贴板把 `\n` 规范成 `\r\n`）
  - AC-5：1440 下目录 `position: sticky`，滚到 700px 后 top 仍是 96；1024 与 375 下 `aside` 为 `display: none`
  - AC-6：`[data-prose]` width 720 / font 16px / line-height 28px
  - AC-7：375px `scrollWidth 375 = clientWidth 375`；代码块自身 `overflow-x: auto`
  - AC-8：`<title>为什么这个站用 MDX 而不是 CMS | Repo Atlas</title>`
  - 目录：5 项（4 个 h2 + 1 个 h3），`href` 与标题 id 一一对应，点进去落在 96px（避开吸顶 header），滚动时 `aria-current` 跟着走
  - 截图：`t007-1440.png` / `t007-375.png` / `t007-list-1440.png`
- 裁判 8/8。它指出的两处「空壳」在本轮修掉：
  - `readingTime` 原来手填 6 分钟，正文实际约 2 分钟。改成 `readingTimeOf(body)` 现算，schema 删掉该字段，内容删掉那一行，并加测试禁止再手填。
  - `ul/ol/blockquote` 没有内容可验：把「什么时候该换掉它」改成三条列表 + 一句引用；`table` 补了一张 MDX vs CMS 对照表（因此引入 `remark-gfm`，不加它 remark 不认 `|` 语法）；`figure/figcaption` 由 `CodeBlock` 承担，不是空样式。
- 技术选择：
  - 高亮不用 rehype 插件，改成构建期把 ``` 围栏替换成 `<CodeBlock html=... code=... />`（base64 传参，避免 MDX 属性里的引号问题），页面不带高亮库。
  - 双主题用 shiki 的 `themes` + `defaultColor: false`，暗色只切 CSS 变量，不重新高亮。
  - 标题 id 与目录共用同一个 `slugify`，中文 id 直接进 `href`。
- 顺手修：`body` 不是 flex 容器，内容少的页面（笔记列表只有 1 篇）页脚浮在半空。改成 `flex min-h-screen flex-col` + `main flex-1`。
- 范围补充：项目详情页的代码块也走同一条 `preprocessCode` 路径（`cal-com` 的 `git clone` 现在有文件名标签和复制按钮）。
