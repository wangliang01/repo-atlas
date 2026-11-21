# Repo Atlas

把值得读的开源项目拆开看的个人技术名片。给面试官（全栈 / AI 应用方向）看，不是内容平台。

## 技术栈
- 语言 / 运行时：TypeScript strict / Node 24
- 框架：Next.js 15 App Router（全站静态优先）
- 包管理器：pnpm
- 数据存储：`content/**/*.mdx`（Git 即 CMS，无数据库）

## 命令
> 只跑最小范围，不要每次跑全量。

| 用途 | 命令 |
|---|---|
| 装依赖 | `pnpm install` |
| 启动开发 | `pnpm dev` |
| 类型检查 | `pnpm tsc --noEmit` |
| 单文件测试 | `node --test lib/schema.test.ts` |
| 全量测试 | `node --test` |
| Lint 单文件 | `pnpm lint --file <path>` |
| 构建 | `pnpm build` |

## 工作流
1. 改完先跑「类型检查 + 本次涉及的测试」，全绿再继续。
2. 一次只做一个最小改动，做完停下来说明改了什么。
3. 不许为了让测试通过而修改测试；要改必须先说明理由并获得同意。
4. 提交前跑 Lint；一个 Ticket 一个提交，单次改动 < 200 行。
5. 完成的标准是跑过并贴出输出，不是 diff 看起来对。

## 红线
- NEVER 新增依赖，除非 Ticket 写明并获同意。
- NEVER 用 `any` / `@ts-ignore` 绕过类型错误，去修根因。
- NEVER 让 `app/` 下出现动态渲染（`force-dynamic` / `revalidate = 0`）；动态只允许在 `/api/ask`。
- NEVER 改动 `globals.css` 的 token 数值或新增第六档字号，除非 Ticket 明确要求并附对比度验证。
- 注释只写「为什么」，不写「做什么」。

## 验收
见 `SPEC.md` 的验收标准；每个 Ticket 的 AC 见 `.scratch/tickets/` 对应文件。
