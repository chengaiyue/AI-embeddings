#!/usr/bin/env bash
# 启动前端开发服务器（React + Vite）
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm --filter @ai-rag/web-ui dev
