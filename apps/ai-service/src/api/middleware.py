"""内部鉴权中间件：校验 X-Internal-Token，/health 除外。"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.config import get_settings

PUBLIC_PATHS = {"/health"}


class InternalTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        token = request.headers.get("X-Internal-Token", "")
        if token != get_settings().internal_token:
            return JSONResponse({"detail": "内部令牌无效"}, status_code=401)

        return await call_next(request)
