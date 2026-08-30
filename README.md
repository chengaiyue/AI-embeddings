# AI RAG Monorepo

三端一体的 RAG 智能问答系统 monorepo：

| 应用 | 技术栈 | 说明 |
| --- | --- | --- |
| `apps/web-ui` | React 18 + TypeScript + Vite | 前端，只请求 NestJS 后端 |
| `apps/nest-backend` | NestJS + TypeORM | BFF / 业务后端，对外暴露 REST 接口，转发请求到内网 Python 服务 |
| `apps/ai-service` | Python FastAPI | AI 内部服务（RAG / LLM / 向量检索），**仅内网访问** |

## 目录结构

```
ai-rag-monorepo/
├── docs/                  # 架构文档、接口文档
├── apps/
│   ├── web-ui/            # 前端（UploadRag 上传页 / ChatAi 对话页）
│   ├── nest-backend/      # NestJS BFF（rag、chat、common 模块）
│   └── ai-service/        # Python FastAPI 内部 AI 服务
├── scripts/               # 启动、构建脚本
├── docker/                # Dockerfile 与 docker-compose 本地编排
├── pnpm-workspace.yaml    # 管理两个 TS 项目
└── README.md
```

## 快速开始

前置依赖：Node.js >= 20、pnpm >= 9、Python >= 3.12（推荐用 [uv](https://docs.astral.sh/uv/) 管理）。

```bash
# 1. 安装 TS 依赖
pnpm install

# 2. 安装 Python 依赖（ai-service）
cd apps/ai-service && uv sync && cd ../..

# 3. 分别启动三个服务（三个终端）
./scripts/dev-ai.sh     # Python FastAPI   -> http://localhost:8000
./scripts/dev-nest.sh   # NestJS BFF       -> http://localhost:3000
./scripts/dev-web.sh    # React 前端       -> http://localhost:5173
```

或使用 Docker 一次性拉起全家桶（含向量库、Redis）：

```bash
cd docker && docker compose up -d
```

## 文档

- [架构文档](docs/architecture.md)
- [接口文档](docs/api.md)
