#!/usr/bin/env bash
# 部署到 blog.wlv587.top：本地静态导出 → tar 过 ssh → 服务器上的 Caddy 直接发文件。
# 线上没有 Node 进程，内存增量为零。
set -euo pipefail

HOST="${DEPLOY_HOST:-root@wlv587.top}"
DIR="${DEPLOY_DIR:-/srv/blog}"

cd "$(dirname "$0")/.."

pnpm build
test -f out/index.html || { echo "构建没有产出 out/index.html"; exit 1; }

# 清空再解压，而不是把目录整个换掉：$DIR 是 caddy 容器的 bind mount，
# 换了 inode 挂载就断了，站点会 404
ssh "$HOST" "mkdir -p $DIR && find $DIR -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
tar czf - -C out . | ssh "$HOST" "tar xzf - -C $DIR"

echo "已部署：https://blog.wlv587.top"
