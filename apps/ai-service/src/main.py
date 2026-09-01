"""FastAPI 入口。
本服务是内部服务，不对外网暴露：
- docker-compose 中不映射公网端口，仅与 nest-backend 处于同一内网
- /internal/* 接口通过 X-Internal-Token 做内部鉴权
"""
