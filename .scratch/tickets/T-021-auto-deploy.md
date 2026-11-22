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

- [ ] 推一次带代码改动的提交，`deploy.yml` 被触发并且 success
- [ ] 推一次只改 `PROGRESS.md` 的提交，`deploy.yml` 不触发
- [ ] 线上页面确实是新构建的产物
- [ ] `picks.yml` 手动触发仍然能跑完（共用 concurrency 后没被自己挡住）
