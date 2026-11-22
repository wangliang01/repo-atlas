#!/usr/bin/env bash
# 部署到 blog.wlv587.top：本地静态导出 → tar 过 ssh → 服务器上的 Caddy 直接发文件。
# 线上没有 Node 进程，内存增量为零。
set -euo pipefail

HOST="${DEPLOY_HOST:-root@wlv587.top}"
DIR="${DEPLOY_DIR:-/srv/blog}"

# CI 里没有 ssh agent，密钥从 Secrets 传进来；本地跑这个脚本时不设这个变量，
# 直接用手上已有的 key
if [ -n "${DEPLOY_SSH_KEY:-}" ]; then
  mkdir -p ~/.ssh
  printf '%s\n' "$DEPLOY_SSH_KEY" > ~/.ssh/id_ed25519
  chmod 600 ~/.ssh/id_ed25519
  ssh-keyscan -H "${HOST#*@}" >> ~/.ssh/known_hosts 2>/dev/null
fi

cd "$(dirname "$0")/.."

pnpm build
test -f out/index.html || { echo "构建没有产出 out/index.html"; exit 1; }

# 清空再解压，而不是把目录整个换掉：$DIR 是 caddy 容器的 bind mount，
# 换了 inode 挂载就断了，站点会 404
ssh "$HOST" "mkdir -p $DIR && find $DIR -mindepth 1 -maxdepth 1 -exec rm -rf {} +"
tar czf - -C out . | ssh "$HOST" "tar xzf - -C $DIR"

echo "已部署：https://blog.wlv587.top"
