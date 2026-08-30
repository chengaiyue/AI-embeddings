#!/usr/bin/env bash
# 启动 NestJS 后端（watch 模式）
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p apps/nest-backend/data
pnpm --filter @ai-rag/nest-backend start:dev
