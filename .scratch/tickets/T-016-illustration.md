# T-016 正文插图能力

## 背景

`juejin-writing` 只覆盖文字，没有配图规范。站点的插图条件也是半成品：`proseComponents` 有 `figure` / `figcaption`，但没有 `img` 渲染器，`public/shots/` 是空目录，`content/` 里一篇都没用过图。

`pnpm check:alt` 这个门禁早就写好了，却一直报「0 张图，空集不算通过」——说明图这件事一直在计划里，只是没落地。

## 目标

1. MDX 里写 `![](...)` 和 `<Figure>` 都能得到和全站一致的版式，不用每篇自己写样式。
2. 有一份可执行的配图规范，说明什么时候该配、配哪种、怎么画。
3. 用一篇真笔记验证整条链路，而不是只交付组件。

## 做法

### 站点侧

- `components/prose.tsx` 加 `img` 渲染器：`loading="lazy"`、`decoding="async"`、`w-full` + 圆角 + `border-line`。
  - 不用 `next/image`：正文图是运行时才知道的 MDX 内容，拿不到宽高，`next/image` 的必填尺寸给不出来。已在原地写了 disable 注释说明理由。
- 新增 `components/figure.tsx`：`<Figure caption="…">` 包一层边框容器 + 图注。
  - 图注用无衬线，不用 `proseComponents.figcaption` 的等宽——等宽配中文会把字距拉开。
  - 容器不放 `bg-surface-2`：浅灰底在大屏上像一块没加载完的占位区。
- `app/notes/[slug]/page.tsx` 注册 `Figure`。

### 规范侧

新增 `.codebuddy/skills/juejin-illustration/SKILL.md`：

- 判断标准只有一条——这段话里有没有「谁挨着谁 / 谁在谁里面 / 先后顺序」。没有就不配。
- 三种图三条产线：内联 SVG（示意图）、`public/shots/` 截图、封面（基本不用）。
- 红线：技术示意图不许用 AI 生图。图里的代码、变量名、箭头方向会错，而且错得很像对的。
- 尺寸约束：viewBox 宽度 300–360。375 屏正文可用约 293px，这个区间缩放比 0.8–1.0，11px 的字落屏还有 9–11px；写 600 宽再缩，字只剩 5px。
- 图注写结论，不写「图 1：示意图」。

`juejin-writing` 里加了一行指过去，并修掉一处旧错误：原文说可以用 `<Callout>`，这个组件根本不存在。

### 内容侧

`content/notes/llmops-token-context.mdx`：按 A 模式（认知纠错）写 LLMOps 第一周，主题是 Token 与上下文窗口，正文里带一张三轮对话的内联 SVG。

## 验收

- `node --test` 全绿，新增一条「正文插图」守卫（懒加载 / 宽度约束 / 图注组件 / 注册）。
- `pnpm typecheck` 退出码 0；`pnpm lint` 改动文件 0 error 0 warning。
- `pnpm build` 9 页全 `○`/`●`，无 `ƒ`。
- `pnpm check:alt`：17 张图全部有 alt（不再报空集）。
- 截图：1440 / 375 两档零溢出；示意图 420×304 / 293×219；暗色下 CSS 变量正常切换。
