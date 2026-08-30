"""FastAPI 入口。

本服务是内部服务，不对外网暴露：
- docker-compose 中不映射公网端口，仅与 nest-backend 处于同一内网
- /internal/* 接口通过 X-Internal-Token 做内部鉴权
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from src.api.internal import internal_router
from src.api.middleware import InternalTokenMiddleware

app = FastAPI(
    title="ai-service",
    description="AI 内部服务：RAG / LLM（仅限 nest-backend 调用）",
    version="0.1.0",
    docs_url="/docs",  # 上线建议关闭：docs_url=None
)

app.add_middleware(InternalTokenMiddleware)
app.include_router(internal_router)


@app.get("/health")
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})
