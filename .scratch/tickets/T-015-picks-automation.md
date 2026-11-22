# [T-015] 精选自动化：一天 4 次同步 + 新上榜标记 + 无限滚动

- **Status**: Done
- **Depends On**: T-010（同步脚本）、T-014（首页收敛后精选是唯一的动态页）
- **Target Files**:
  - `lib/picks-history.ts`（新）、`lib/picks-history.test.ts`（新）
  - `scripts/sync-ai-picks.mjs`、`scripts/picks-cron.mjs`（新）、`scripts/picks-cron.cmd`（新）、`scripts/install-picks-task.ps1`（新）
  - `.github/workflows/picks.yml`（新）
  - `content/picks/history.json`（新）、`content/picks/ai.mdx`（新增 firstSeen 字段）
  - `lib/schema.ts`、`lib/picks.ts`、`components/pick-row.tsx`、`components/picks-view.tsx`、`app/picks/page.tsx`
  - `lib/picks.test.ts`

## 要解决的问题

精选数据靠手动 `pnpm sync:picks`，一天最多更新一次；榜单整份重写，所以「谁是新来的」这条信息根本不存在；列表一次渲染 26 条，涨到几百条时会卡。

## 范围

- 做：定时任务（本地 Windows 计划任务 + GitHub Actions 两套）；首次上榜台账，当天新条目打「新上榜」；列表分页 + 滚动到底自动追加。
- 不做：不做站内收藏/订阅；不做增量抓取（GitHub 搜索 API 没有增量接口，每次都是全量 26 条）；不做推送通知。

## 关键决定

- **台账单独存一份，不靠快照自己记**。快照每次整份重写，记不住「第一次出现」。所以 `content/picks/history.json` 存 `repo → 首次上榜日期`，同步时把 `firstSeen` 写回每条，页面纯静态就能标「新上榜」，不需要运行时查历史。
  - 落榜超过 120 天才从台账里删：免得无限长，也免得短暂掉榜的仓库回来时被当成新的。
  - 键按字母排序：每次重写保持稳定，diff 里只出现真正的变化。
  - **建台账的第一天所有条目都是「新」**，全标等于没标。所以页面上加了一条守卫：`fresh.size < entries.length` 才显示徽章。
- **提交只碰两个路径**。定时任务每 6 小时跑一次，`git commit -- content/picks public/avatars`，即使工作区别处有暂存内容也不会被卷进来。没有 remote 就只提交不推送。
- **同步前先捞出 `why`**。`why` 是手写的判断，API 给不出来；以前手动同步不会注意，现在一天跑 4 次，不先读出来就会被整份重写冲掉。
- **一天 4 次 = 每 6 小时**。本地用 `schtasks /SC HOURLY /MO 6`；CI 用 `0 1,7,13,19 * * *`（UTC，对应北京时间 09/15/21/03）。仓库目前没有 remote，所以 CI 那套先写好，推上去就生效。
- **分页 12 条 + `IntersectionObserver` 提前 200px 触发**，滚到底之前就接上，不会看到空白。换筛选条件回到第一屏，否则会带着上一次翻的页数。保留「加载更多」按钮给键盘用户和关掉 observer 的环境。

## 验收标准（必须可执行）

- [x] AC-1：`node --test` 全绿；`pnpm typecheck` 0；`pnpm lint` 0 error
- [x] AC-2：`pnpm build` 7 页全 `○` / `●`
- [x] AC-3：快照每条都有 `firstSeen`，`history.json` 覆盖全部条目
- [x] AC-4：台账合并逻辑有 5 条测试（首次、二次、同日重复、120 天剪枝、键序稳定）
- [x] AC-5：`/picks` 首屏只渲染 12 条，滚到底后 26 条全部出现、按钮消失
- [x] AC-6：当天新上榜的条目渲染出「新上榜」徽章；全部都是新的时候不渲染
- [x] AC-7：`scripts/picks-cron.mjs` 跑通，且只提交 `content/picks` 与 `public/avatars`
- [x] AC-8：375 / 1440 两档零横向溢出

## 完成记录

- 提交：见 PROGRESS.md「已完成」
- 证据（输出 / 截图 / 响应）：
  - AC-1：`node --test` 77/77；`tsc --noEmit` 0；`eslint` 0 error（10 条 warning 全在 `.audit/` 探针）
  - AC-2：`○ /` `○ /picks` `○ /notes` `● /notes/[slug]`，7 页
  - AC-3：`grep -c "firstSeen: 2026-11-22"` = 26；`history.json` 26 条，测试断言覆盖
  - AC-4：`picks-history.test.ts` 5/5
  - AC-5：CDP 实测 `initial 12 → scroll 24 → scroll 26`，「加载更多」消失
  - AC-6：临时把 25 条的 `firstSeen` 挪到前一天，`curl /picks | grep 新上榜` = 1，截图确认徽章在名字右侧；恢复后台账回到全 2026-11-22，徽章数 0（首日守卫生效）
  - AC-7：`[18:51] 开始同步 → 写入 26 条 → 新上榜 0 个 → 没有 remote，只提交不推送`，生成 `08be5f8 chore(picks): 同步 AI 精选 2026-11-22 18:51`，`git status` 里其他改动没被带走
  - AC-8：`overflow 0`（1440 / 375）
  - 截图：`picks-1440.png` / `picks-375.png`，交付前看过
- 实现说明：
  - `mergeHistory(history, repos, today, keepDays)` 是纯函数，同步脚本只负责读写文件。
  - `sameDay(a, b)` 放在 `lib/picks.ts`：`dateOnly` 解析出的是本地零点，直接比时间戳会因为时区差一天。
  - `PicksView` 多接一个 `syncedAt`，用 `sameDay(firstSeen, syncedAt)` 判断新上榜——不用 `new Date()`，否则静态页面上的「今天」会永远是构建那天。
  - 无限滚动的 observer 依赖 `visible.length`：换筛选后重新挂载，sentinel 只在还有剩余时渲染，到底自动卸载。
- 已知取舍：
  - **Windows 计划任务没装上**：当前账号执行 `schtasks /Create` 返回「拒绝访问」，需要管理员权限。脚本已就绪，用管理员 PowerShell 跑 `scripts/install-picks-task.ps1` 即可。
  - 仓库没有 remote，所以 CI 的 `picks.yml` 目前不会跑；推送到 GitHub 后自动生效（需要仓库有 Actions 权限）。
  - 每 6 小时一次全量同步会消耗 GitHub 搜索额度（匿名 10 次/分钟、core 60 次/小时）。一天 8 次搜索没问题，但连续手动重跑会被限流，CI 里带上 `GITHUB_TOKEN` 可提到 5000。
