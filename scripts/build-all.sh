#!/usr/bin/env bash
# 构建全部：前端产物 + Nest 产物 + Python 检查/测试
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 构建前端 (web-ui)"
pnpm --filter @ai-rag/web-ui build

echo "==> 构建 NestJS 后端 (nest-backend)"
pnpm --filter @ai-rag/nest-backend build

echo "==> Python 代码检查 + 测试 (ai-service)"
if command -v uv >/dev/null 2>&1; then
  (cd apps/ai-service && uv sync && uv run ruff check src tests && uv run pytest)
else
  echo "未检测到 uv，跳过 Python 构建检查" >&2
fi

echo "==> 全部构建完成"
