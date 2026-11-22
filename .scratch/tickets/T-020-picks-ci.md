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

`0a4302a` 那次推送是用 SSH 推的（`gh repo create --push` 因为 token 缺 `workflow` scope 被拒），workflow 文件的索引没触发。先做一次改动重新推一遍，看是不是纯索引问题。

顺手补一条 `timeout-minutes`：`concurrency` 的 `cancel-in-progress` 是 `false`，一次卡死的 run 会把后面所有定时任务堵在队列里，默认上限 360 分钟太长。

## 改动

- `.github/workflows/picks.yml`：`sync` job 加 `timeout-minutes: 15`

## 验收

- [ ] `gh api repos/wangliang01/repo-atlas/actions/workflows` 返回 `total_count: 1`，`state: active`
- [ ] `gh workflow run picks` 能手动触发，run 走完是 success
- [ ] run 结束后 `content/picks.json` 有变化（或者确认无新增时是空提交，不报错）
- [ ] 定时表达式确认是 UTC `0 1,7,13,19 * * *`（北京时间 09/15/21/03）

## 如果还是不被识别

GitHub 对「首次出现在仓库里的 workflow」有时要求网页上点一次授权（Settings → Actions → General → Workflow permissions 选 `Read and write permissions`）。点完之后再推一次。

再不行就退回服务器侧：`/srv/blog` 是纯静态目录，服务器上起一个 `cron` + `node scripts/picks-cron.mjs` 也行，但服务器只有 Node 16，得先解决运行时——这是下策，会破坏 T-019「线上零 Node 进程」的前提。
