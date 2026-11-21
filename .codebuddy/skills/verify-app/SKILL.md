---
name: verify-app
description: 用真实运行的方式验证 Repo Atlas 的改动是否生效，并产出可审查的证据。任何改动声称完成前必须跑一遍。
---

# 验证 Repo Atlas

按顺序执行，任何一步失败就停下并原样贴出输出，不要跳过、不要重试超过两次。

## 0. 前置

```bash
pnpm install          # 首次或依赖变更后
```

## 1. 静态检查

```bash
pnpm typecheck
pnpm lint --file <本次改动的文件>      # 只查本次改的文件
```

## 2. 测试

```bash
node --test lib/schema.test.ts        # 内容层
node --test                           # 全量；P0 阶段只有 lib/ 下几条
```

必须贴出「通过数 / 失败数」。P0 没有页面级自动化测试，页面靠第 3 步。

## 3. 真实运行

```bash
pnpm build            # 必须看到 / 、/projects/[slug] 、/notes/[slug] 为静态标记
pnpm dev
```

触发本次改动的功能（按改动类型选）：

```bash
# 页面可达
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/projects/cal-com
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/notes/why-mdx

# 文案 / 结构是否真的渲染出来
curl -s localhost:3000/ | grep -c '把值得读的开源项目，拆开看。'

# 内容校验是否生效（破坏一条 frontmatter 必填字段，构建必须失败）
pnpm build; echo "exit=$?"
```

浏览器（375px 与 1440px 各一次）：

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth  // 期望 true
getComputedStyle(document.body).backgroundColor                               // 暗色期望 rgb(18, 18, 17)
```

## 4. 结论

输出四行，缺一不可：

```
改动是否生效：是 / 否
证据：<贴关键输出或截图路径>
边缘情况：<列出没覆盖的，或写"已覆盖 X/Y/Z">
风险：<可能影响到的其他功能>
```

## 禁止

- 只贴 diff 就说「已完成」
- 用「应该可以」「理论上」代替实际运行
- 为了让验证通过而放宽测试
- 编造命令输出（本文件里的样例输出必须由真实运行产生，T-001 完成后回填）
