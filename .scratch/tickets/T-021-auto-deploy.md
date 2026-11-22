# T-021 推 master 自动部署

## 目标

笔记写进 `content/**/*.mdx` 之后，`git push` 就该看到线上更新，不用再记得手动跑 `bash scripts/deploy.sh`。

## 背景

T-019 只给了手动部署脚本，T-020 让精选同步在 CI 里自己部署。笔记这条路还是断的：`app/notes/[slug]/page.tsx` 走 `generateStaticParams` + 构建期读 mdx，push 之后线上不会变。

## 关键约束：GITHUB_TOKEN 推的提交不会触发别的 workflow

GitHub 明文规定：用 `GITHUB_TOKEN` 产生的事件不会创建新的 workflow run（防递归）。所以 picks 那 4 次自动提交**不会**触发新的 `deploy.yml`，picks.yml 里的部署步骤必须留着。

两条路各管一段：

| 谁推的 | 谁部署 |
|---|---|
| 人（`git push`） | `deploy.yml`，`on: push` |
| `picks.yml` 里的 bot | picks.yml 自己的部署步骤 |

## 并发

两个 workflow 都会「清空 `/srv/blog` → 解压」，同时跑会得到一半新一半旧的站点。用同一个 `concurrency: group: deploy` 串起来，`cancel-in-progress: false`——部署中途被杀同样会留下半个站点。

## 改动

- `.github/workflows/deploy.yml`（新）：`push` 到 `master` + `workflow_dispatch`；`paths-ignore: ["**.md", ".scratch/**"]`，只改文档不重建（笔记是 `.mdx`，不会被这条挡掉）
- `scripts/deploy.sh`：把「写 ssh key + keyscan」从 workflow 里搬进来，靠 `DEPLOY_SSH_KEY` 是否设置来分支；本地跑不设这个变量，用手上已有的 key
- `.github/workflows/picks.yml`：部署步骤只剩一行 `bash scripts/deploy.sh`；`concurrency` 从 `picks` 改成 `deploy`
- `AGENTS.md`：部署一节补上自动部署与两条路的分工

## 验收

- [x] 推一次带代码改动的提交，`deploy.yml` 被触发并且 success（`623400e` → run `45028771030`）
- [x] 推一次只改 `PROGRESS.md` 的提交，`deploy.yml` 不触发（`780fe24` 之后 `deploy.yml` 的 run 列表还是只有 `623400e` 那条）
- [x] 线上页面确实是新构建的产物：`/srv/blog/index.html` mtime `21:41:34 +0800`，`Last-Modified: Sun, 22 Nov 2026 13:41:34 GMT`，与 run 的构建时刻一致
- [x] `picks.yml` 手动触发仍然能跑完（run `45028943012` success，共用 concurrency 后没被自己挡住，日志有「已部署」）

## 一个已知的边界

`paths-ignore` 只在**整次推送全是文档**时才跳过。夹了代码的提交照样重建，这是对的——但反过来，如果只改了 `content/notes/*.mdx` 里的一行字，也会走一次完整构建。静态站没有增量构建，接受。
