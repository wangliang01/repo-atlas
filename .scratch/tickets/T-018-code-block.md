# T-018 代码块重做

## 背景

用户贴了一张 json 代码块的截图：「这个代码片段设计得不是太好看，你能再美化一下吗」。

原来的样子：直角、白底、头部用 `bg-bg/60` 叠一层几乎看不出的灰、语言标签用 `text-ink`、复制按钮是裸文字、代码用 vitesse 主题（字符串橄榄绿、数字青灰）。

## 问题拆开看

1. **没有圆角**。全站卡片都是 4px，代码块是唯一一个直角的方块，看着像表格单元格。
2. **头部和代码区几乎同色**，只靠一条 hairline 分界，双层描边（外框 + 头部底线）在直角上更明显。
3. **语言标签用 `text-ink`**，比代码本身还重，抢注意力。
4. **复制按钮只有 12px 文字**，没有内边距、没有 hover，看不出能点。
5. **配色发闷**。`vitesse-light` 是当年米色纸面时期选的（`lib/highlight.ts` 的注释还写着「压不住 --bg 的米色」），底色换成掘金灰白之后，它的黄绿色调和蓝主色打架。

## 改动

- `components/code-block.tsx`
  - `rounded-[4px]`，和 `.panel` 一致
  - 头部 `h-9` 定高 + `bg-surface-2` + `border-b`，靠底色分层而不是靠线
  - 语言/文件名改 `text-muted`，前面加一个 6px 的 `bg-accent` 圆点
  - `mt-6` → `mt-[22px]`，跟正文段距一致
- `components/copy-button.tsx`：`px-2 py-1.5` + `rounded-[3px]` + `hover:bg-line/70`，点得到也看得出能点
- `lib/highlight.ts`：`vitesse-light/dark` → `github-light/dark`。藏青字符串、红色关键字、紫色函数名，和蓝色主色是一路的

## 没改

代码字号还是 13px（掘金是 12px）。13px 在这套 16px 正文里已经偏小，再降一档读起来费劲。

## 验收

- `node --test` 79/79；typecheck 0；lint 0 error。
- `pnpm build` 9 页全 `○`/`●`；`pnpm check:alt` 17 张全有 alt。
- 截图：json 块（浅/深）、ts 块、`lib/content.ts` 带文件名块，1440 与 375 两档；长行在 375 下容器内横滚，页面零溢出。
- 生产构建与 dev 渲染一致（同一张截图对比）。
