#!/usr/bin/env bash
# 启动 Python FastAPI AI 服务（热重载）
set -euo pipefail
cd "$(dirname "$0")/../apps/ai-service"

if command -v uv >/dev/null 2>&1; then
  [ -d .venv ] || uv sync
  exec uv run uvicorn src.main:app --reload --host "${AI_HOST:-0.0.0.0}" --port "${AI_PORT:-8000}"
else
  echo "未检测到 uv，请先安装：curl -LsSf https://astral.sh/uv/install.sh | sh" >&2
  exit 1
fi
