# Repo Atlas

我跑过的开源项目、和它们的真实成色的个人技术名片。给面试官（全栈 / AI 应用方向）看，不是内容平台。

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
| 类型检查 | `pnpm typecheck` |
| 单文件测试 | `node --test lib/schema.test.ts` |
| 全量测试 | `node --test` |
| Lint 单文件 | `pnpm lint <path>` |
| 构建 | `pnpm build` |
| 图片 alt 检查（扫构建产物） | `pnpm check:alt` |
| 同步 AI 精选快照（GitHub API） | `pnpm sync:picks [--dry-run]` |
| 部署到线上 | `bash scripts/deploy.sh` |

## 信息架构
导航只有三项：首页 `/`、精选 `/picks`、笔记 `/notes`。`/projects` 整条路由已删（T-014）：列表页 308 到 `/`，详情页 404。

三个列表页共用 `components/site-shell.tsx` 的三栏（左索引 / 中 feed / 右个人信息）：`md` 起出左栏，`xl` 起才出右栏，更窄时右栏内容降级到 feed 末尾的 `ShellStrip`。宽度常量在 `lib/layout.ts`，但栅格 className 必须写字面量——Tailwind v4 不扫模板字符串。

## 视觉语言
掘金式信息流：灰画布 + 白卡片（`.panel`，4px 圆角）+ 蓝主色 + 无衬线。所有数值都是从 juejin.cn 实测来的，记在 `app/globals.css` 顶部的注释里。

- 蓝色分三个 token，别混用：`--accent` 只做填充和装饰；`--accent-ink` 是所有 ≤16px 的蓝字；`--accent-fill` 是实心按钮/徽章底（配白字）。一个 `#1e80ff` 当文字只有 3.76:1，过不了 AA。
- 没有衬线字体。`--font-serif` 已经删掉，别再加回来。
- 字号六档：28 / 24 / 18 / 16 / 13 / 12。
- 两个实测踩过的坑：aside 不能加 `self-start`（sticky 失去行程）；feed 面板不能加 `overflow-hidden`（它会变成 sticky 的包含块，`top-[60px]` 改成从面板顶算）。两条都有测试锁着。
- 正文插图两条产线：示意图写内联 `<svg>`（外部 svg 文件拿不到 CSS 变量，暗色会糊），套 `components/figure.tsx` 的 `<Figure>`；截图走 `public/shots/<slug>/` + `![]()`，`proseComponents` 的 `img` 已带懒加载和宽度约束。技术示意图不许用 AI 生图。

## 工作流
1. 改完先跑「类型检查 + 本次涉及的测试」，全绿再继续。
2. 一次只做一个最小改动，做完停下来说明改了什么。
3. 不许为了让测试通过而修改测试；要改必须先说明理由并获得同意。
4. 提交前跑 Lint；一个 Ticket 一个提交，单次改动 < 200 行。
5. 完成的标准是跑过并贴出输出，不是 diff 看起来对。
6. 跑 `pnpm build` 前先确认没有 `next dev` **或 `next start`** 在跑：两者都占用 `.next`，同时构建会写坏产物。踩过的坑：`next start` 还在跑时重建，构建「成功」但 `.next/server/app/notes/` 整个没了，`/notes/why-mdx` 变成 404。`TaskStop` 只杀 pnpm 外壳，`next` 子进程会残留——用 `Get-CimInstance Win32_Process | Where CommandLine -like "*本项目路径*"` 查出来再杀干净；保险起见 `rm -rf .next` 后重建。

## 部署

线上是 `https://blog.wlv587.top`，跑在一台 1.7G 内存的轻量云上。

- **静态导出，没有 Node 进程**。`next.config.ts` 里 `output: "export"`，构建产物是 `out/`，由服务器上已有的 Caddy 容器直接发文件。给这个站多开一个 Node 进程要吃掉一两百兆，不划算。
- 导出带来两个约束：`next.config` 的 `redirects()` 用不了（`/projects → /` 的 308 写在 `deploy/Caddyfile` 里）；`next/image` 必须 `unoptimized`，否则头像会指向不存在的 `/_next/image`。
- `bash scripts/deploy.sh` 做三件事：构建 → tar 过 ssh → 解到 `/srv/blog`。解压前会清空目录，**但不会替换目录本身**——`/srv/blog` 是 Caddy 容器的 bind mount，换 inode 挂载就断了。
- **推 master 就自动上线**（`.github/workflows/deploy.yml`），所以改笔记只要 commit + push。只改 `.md` 或 `.scratch/**` 的推送会跳过构建。本地仍然可以手动跑 `scripts/deploy.sh`。
- `.github/workflows/picks.yml` 每天 4 次同步精选，有变化时也会在 CI 里跑一遍 `scripts/deploy.sh`。picks 的提交是 `GITHUB_TOKEN` 推的，GitHub 不会用它触发 `deploy.yml`，所以那边必须自己部署。两个 workflow 共用 `concurrency: group: deploy`，不会同时动 `/srv/blog`。
- 两个 workflow 都靠仓库 Secrets 里的 `DEPLOY_HOST` / `DEPLOY_SSH_KEY` ssh 到服务器——这把钥匙在 `root` 的 `authorized_keys` 里，泄露就等于交出服务器，换机器时记得一起换。
- 80/443 由 Docker 里的 `edge_caddy` 持有，宿主机上的 nginx 没在跑。改站点配置是改 `/opt/edge/Caddyfile`（仓库里 `deploy/Caddyfile` 是副本），改完 `docker exec edge_caddy caddy reload --config /etc/caddy/Caddyfile` 热加载，不要 `docker compose up -d` 除非要加挂载。
- 证书由 Caddy 自动申请续期，不用管。

## 红线
- NEVER 新增依赖，除非 Ticket 写明并获同意。
- NEVER 用 `any` / `@ts-ignore` 绕过类型错误，去修根因。
- NEVER 让 `app/` 下出现动态渲染（`force-dynamic` / `revalidate = 0`）；`output: "export"` 已经把这条路堵死了。
- NEVER 改动 `globals.css` 的 token 数值或新增字号档位，除非 Ticket 明确要求并附对比度验证。
- 注释只写「为什么」，不写「做什么」。

## 验收
见 `SPEC.md` 的验收标准；每个 Ticket 的 AC 见 `.scratch/tickets/` 对应文件。
