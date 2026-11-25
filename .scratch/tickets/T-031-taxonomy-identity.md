# [T-031] 分类改三层：用途 / 形态 / 身份，形态提纯，新增逆向工程

- **Status**: Done
- **Depends On**: T-030

## 要解决的问题

1. `morluto/rea` 的左栏显示成 `MCP / 协议 / 连接器 / CLI / 本地工具`——两个复合形态标签拼起来，读者会以为是五个分类。
2. `逆向` 没有位置：`rea` 只能落到「安全与合规 + 编码与开发」，`rea-video` 只能落到「视频与音频」，按用途找不到「逆向工具」。
3. 形态表混了交付方式、协议、角色和能力：`Agent 运行时`、`记忆 / 上下文`、`工作流 / 方法论` 都不是「从哪儿打开它」。
4. 缺少「谁在搜它」这一层：前端、自媒体、安全这类身份查不到。

## 已确认的方向

| 维度 | 回答 | 变化 |
|---|---|---|
| 用途 `domains` | 拿它做什么活 | 新增 `逆向工程` |
| 形态 `forms` | 从哪儿打开它 | 15 个复合标签 → 11 个原子标签，不带斜杠 |
| 身份 `identities` | 谁在搜它 | 新增字段，13 个值，可空 |

新形态：`CLI`、`桌面应用`、`Web 应用`、`插件`、`MCP 服务`、`Skill`、`提示词`、`SDK 与库`、`自托管服务`、`数据集`、`文档与模板`。

身份：`前端`、`后端`、`移动端`、`数据`、`算法`、`AI`、`运维`、`安全`、`测试`、`设计`、`产品`、`自媒体`、`研究`。

规范已写进 `AGENTS.md` 的「分类规范」。

## 本次试点范围（已做）

- `lib/categories.ts`：新增 `FORMS` 新表、`LEGACY_FORMS` 迁移期兼容、`IDENTITIES`、`MAX_IDENTITIES`；`DOMAINS` 加 `逆向工程`。
- `lib/schema.ts`：`forms` 迁移期接受新旧两表；新增 `identities`（0–2，默认空）。
- `lib/picks.ts`：`identitiesOf`、`pickIdentities`，`PickFilter` 加 `identity`，筛选变成三轴。
- 界面：右栏「用途 / 形态 / 身份」用 `、` 连接；列表行固定三枚标签；左栏加「身份」第二组，窄屏也显示组标题。
- 三篇试点：`heydamir/unslop`、`morluto/rea`、`juneyaooo/rea-video`。
- 测试：新增 `lib/categories.test.ts`（形态无斜杠、新旧表不重叠、试点页用新表）；`picks.test.ts` 补身份筛选与计数。

## 全量范围（已完成）

- 73 篇 `content/repos/*.mdx`：`forms` 全部换成新表；`domains` 去掉 `通用与跨领域`；`identities` 全部填上（`cjpais/handy`、`routinemiku/apkstart`、`meetsaini/emulator` 确实无身份，留空）。
- `lib/categories.ts`：删除 `通用与跨领域` 与 `LEGACY_FORMS`；`FORMS` 补 `移动应用`（openclaw、phonebox）；`schema.ts` 的 `forms` 收紧成只认新表。
- 测试：`lib/categories.test.ts` 改为全站守卫——形态/身份只认新表、无兜底领域、「其他」≤2 篇、身份留空 ≤5 篇、「用了 AI ≠ 身份 AI」抽检。
- 逐篇重打标签的映射脚本在 `.scratch/retag-all.mjs`，可复查。

## AC

- [x] 形态表不再有斜杠复合标签，新旧表不重叠。
- [x] 三篇试点页通过 schema，右栏显示「用途 / 形态 / 身份」三行，分隔符为 `、`。
- [x] 首页左栏出现「用途」「身份」两组，可同时筛选；列表行每层只显示首项。
- [x] `node --test` 117/117；`pnpm typecheck` 0；`pnpm lint` 0 error；`pnpm build` 84 页静态导出。
- [x] 截图确认：`/picks/morluto--rea`、`/picks/heydamir--unslop`、`/picks/juneyaooo--rea-video`、首页。
- [x] 73 篇全量重打标签，删除 `LEGACY_FORMS` 与 `通用与跨领域`。
- [x] 全量后截图：首页（左栏两组齐全、行内三枚标签）、openclaw（自托管服务）、upscayl（桌面应用）。

## 风险

- 身份是主观字段，73 篇由多人/多轮填写容易不一致；规则是「写人，不写活」。
- 形态重新归类要逐篇判断（尤其是 `桌面 / Web 应用`、`Agent 运行时`、`记忆 / 上下文`），不能机械替换。
- 全量迁移前不删 `LEGACY_FORMS`，否则构建会红。

## 进度

- 2026-11-25：三篇试点、三层 UI、迁移期 schema 与测试完成。
- 2026-11-25：73 篇全量重打标签；删除迁移期兼容；`node --test` 118/118。
