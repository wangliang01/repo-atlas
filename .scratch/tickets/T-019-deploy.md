# T-019 部署到 blog.wlv587.top

## 目标

1. 站点上线到 `https://blog.wlv587.top`
2. 控制内存占用
3. 代码推到 GitHub

## 服务器现状（实测）

| 项 | 值 |
|---|---|
| 主机 | 101.37.12.36，2 核 / 1.7G 内存 / 已用 763M，可用 809M |
| 80 / 443 | Docker 容器 `edge_caddy`（caddy:2.9）持有；宿主机的 nginx 没在跑 |
| 已有站点 | `wlv587.top`、`car.wlv587.top`（反代 car_service_nginx）、`omni.wlv587.top`（反代 omniroute）、`tv.wlv587.top`（静态 `/srv/catalog`） |
| Node | v16.20.2 —— 跑不了 Next 15（要 18+） |
| DNS | `blog.wlv587.top` 已经解析到 101.37.12.36 |

## 判断：静态导出，不加 Node 进程

服务器可用内存只有 800M，跑一个 `next start` 大概吃 150–200M，而且 Node 版本还不达标，得先装 Node 20 或者上 Docker。

站点本来就是全静态（构建产物全是 `○`/`●`），所以直接 `output: "export"` 出 `out/`，交给已经在跑的 Caddy 发文件——**内存增量是零**，也不用装任何运行时。

代价两条，都写进了 `next.config.ts` 的注释：

1. `redirects()` 不支持 export，`/projects → /` 的 308 挪到 Caddy 里发。
2. `next/image` 没有优化端点，必须 `unoptimized`。这一条是部署后发现的：首页头像指向 `/_next/image?url=%2Favatar.jpg`，静态服务器上 404。

## 改动

- `next.config.ts`：`output: "export"` + `images.unoptimized`
- `scripts/deploy.sh`：构建 → `tar czf - | ssh` → 解到 `/srv/blog`
  - 解压前清空目录，但**不替换目录本身**：`/srv/blog` 是 Caddy 的 bind mount，换 inode 挂载就断
- `deploy/Caddyfile`：站点配置的仓库副本
  - `try_files {path}.html {path} {path}/index.html` —— 导出产物是 `notes/foo.html`，要能按 `/notes/foo` 访问
  - `/_next/static/*` 加 `immutable` 一年缓存
  - `handle_errors` 把 404 落到 `404.html`，状态码保持 404
- 服务器侧：`/srv/blog` 新建 + 给 `/opt/edge/docker-compose.yml` 加一条 bind mount，`docker compose up -d` 重建 Caddy

## 上线前做的保护

改之前把 `Caddyfile` 和 `docker-compose.yml` 各备份一份（`*.before-blog`）；Caddyfile 先用一次性容器 `caddy validate` 过一遍再重建，避免配置写错把四个站点一起弄挂。

## 验收

- `https://blog.wlv587.top/`、`/notes`、`/notes/llmops-token-context`、`/picks` 全 200
- `/projects` → 308 到 `/`；`/notes/does-not-exist` → 404（状态码正确，不是 200 的空壳）
- CSS 带 `Cache-Control: public, max-age=31536000, immutable`
- 首页 `imgBroken: 0`（头像正常）；Inter / Noto Sans SC 字体正常加载
- 1440 与 375 两档零溢出
- 其他三个站点未受影响：`wlv587.top` 200、`omni.wlv587.top` 307、`tv.wlv587.top` 404（它的根目录放的是 JSON 数据，不是网页，本来就是 404）
- `pnpm check:alt` 17/17；`node --test` 79/79
