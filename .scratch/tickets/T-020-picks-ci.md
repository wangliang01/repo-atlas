# T-020 精选定时任务在 GitHub Actions 上真正跑起来

## 背景

T-015 把「精选一天 4 次同步」写成了 `.github/workflows/picks.yml`，T-019 把代码推到了 `https://github.com/wangliang01/repo-atlas`。但推完之后 GitHub 一直不认这个 workflow。

## 现象

```
gh api repos/wangliang01/repo-atlas/actions/workflows  → {"total_count": 0}
gh workflow list -R wangliang01/repo-atlas             → no workflows found
curl https://api.github.com/.../actions/workflows      → {"total_count": 0}   （不带 token 也是 0）
```

排除掉的：

| 怀疑点 | 实测 |
|---|---|
| 文件没推上去 | `contents/.github/workflows/picks.yml` 有，1037 字节，sha `6d0aeb6` |
| 推错分支 | 默认分支就是 `master`，文件在 `master` 上 |
| 文件内容坏了 | base64 解出来是正常 UTF-8 + LF，无 BOM，YAML 合法 |
| 仓库私有导致读不到 | `private: false` |
| Actions 被关 | `actions/permissions` 返回 `{"enabled": true, "allowed_actions": "all"}` |
| token 权限不够 | 不带 token 的 curl 也返回 0，不是 403 |

另一个旁证：`repos/.../` 返回的 `size` 是 `0`，说明 GitHub 的后台统计任务也还没跑过这个仓库。

## 判断

`0a4302a` 那次推送是用 SSH 推的（`gh repo create --push` 因为 token 缺 `workflow` scope 被拒），workflow 文件的索引没触发。**再推一次就恢复了**：补了 `timeout-minutes` 之后推 `470c1c1`，10 秒内 `total_count` 从 0 变 1，`state: active`。

结论：不是权限、不是 YAML、不是分支问题，纯粹是 GitHub 后台没索引到那个文件。以后再遇到「文件在但 Actions 看不见」，改一行再推一次即可，不用去网页点授权。

顺手补一条 `timeout-minutes`：`concurrency` 的 `cancel-in-progress` 是 `false`，一次卡死的 run 会把后面所有定时任务堵在队列里，默认上限 360 分钟太长。

## 改动

- `.github/workflows/picks.yml`：`sync` job 加 `timeout-minutes: 15`
- `scripts/picks-cron.mjs`：`git()` 容忍 `execFileSync` 返回 `null`

## 顺带修掉的 bug：推送成功却报「推送失败」

第一次手动跑（run `45027679239`，19 秒 success）的日志里：

```
To https://github.com/wangliang01/repo-atlas
   470c1c1..3aae696  master -> master
[2026-11-22 13:28] 推送失败，提交已留在本地
```

push 明明成功了，脚本却走了 catch。根因：`git(["push"], { stdio: "inherit" })` 时 `execFileSync` 返回 `null`（实测：`inherit 返回: null`，默认 `"470c1c1\n"`），后面 `.trim()` 抛 TypeError，被 catch 吞成「推送失败」。

这个 bug 的危害不是日志难看——是**真失败时也分不清**。修法是在 `git()` 里 `(out ?? "").trim()`。

## 还没解决：CI 提交了，线上不会变

`app/picks/page.tsx` 走 `getPicksSnapshot()`，是构建时 `readFileSync("content/picks/*.mdx")`。所以 Actions 每天 4 次更新仓库里的 mdx，`blog.wlv587.top/picks` 还是上次部署时烘进去的旧数据。

修法（已确认）：workflow 里在 commit 之后跑 `scripts/deploy.sh`。密钥方案是新建一把专用 ed25519，公钥进服务器 `root` 的 `authorized_keys`，私钥存仓库 Secrets（`DEPLOY_SSH_KEY` / `DEPLOY_HOST`）。

只在 `sync` 那一步真的产生新提交时才部署（用 `git rev-parse HEAD` 前后对比，写进 `$GITHUB_OUTPUT`），`workflow_dispatch` 手动触发则无条件部署，方便验证。

另外 `lib/routes.test.ts` 那条 308 断言原来是查 `next.config.ts` 的 `redirects()`，T-019 之后永远不可能为真，改成查 `deploy/Caddyfile` 里的 `redir /projects / 308`（已获同意）。

## 验收

- [x] `gh api repos/wangliang01/repo-atlas/actions/workflows` 返回 `total_count: 1`，`state: active`
- [x] `gh workflow run picks` 能手动触发，run 走完是 success（19 秒）
- [x] run 结束后远端 `master` 多了一条 `chore(picks): 同步 AI 精选 2026-11-22 13:28`（`3aae696`）
- [x] 定时表达式确认是 UTC `0 1,7,13,19 * * *`（北京时间 09/15/21/03）
- [ ] CI 部署步骤能真的把新数据送上线（`workflow_dispatch` 触发，看 `/picks` 的更新时间变）
- [x] `node --test` 79/79（含改写后的 308 断言）

## 如果还是不被识别

这次不是这个原因，但留个记录：GitHub 对「首次出现在仓库里的 workflow」偶尔要求网页上点一次授权（Settings → Actions → General → Workflow permissions 选 `Read and write permissions`）。点完之后再推一次。

服务器侧 `cron` 是下策：`/srv/blog` 是纯静态目录，服务器只有 Node 16，跑不了 `sync-ai-picks.mjs` 依赖的那套工具链，也会破坏 T-019「线上零 Node 进程」的前提。
