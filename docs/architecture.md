# 架构文档

## 总体架构

```
┌──────────────┐        HTTPS/HTTP         ┌──────────────────┐       内网 HTTP        ┌──────────────────┐
│   web-ui     │ ────────────────────────▶ │   nest-backend   │ ────────────────────▶ │   ai-service     │
│ React + Vite │    REST / SSE             │  NestJS (BFF)    │    REST / SSE 转发     │  FastAPI (内部)   │
└──────────────┘                           └────────┬─────────┘                       └────────┬─────────┘
                                                    │                                          │
                                                    ▼                                          ▼
                                             ┌──────────────┐                        ┌──────────────────┐
                                             │  MySQL/PG    │                        │  向量库 (Milvus/  │
                                             │ 会话/用户存储 │                        │  Qdrant) + Redis │
                                             └──────────────┘                        └──────────────────┘
```

## 职责划分

### web-ui（前端）
- `pages/UploadRag`：上传文档（pdf / md / txt / docx）到 RAG 知识库，展示处理进度与切片状态。
- `pages/ChatAi`：AI 对话界面，通过 SSE 接收流式回答，展示引用来源。
- `api/`：**只请求 NestJS 后端**，不直接访问 Python 服务。
- `store/`：会话与消息状态管理（zustand）。

### nest-backend（NestJS BFF，唯一对外入口）
- 鉴权（JWT）、限流、统一异常过滤、响应拦截。
- `modules/rag`：接收文件上传（multipart），校验后转发给 Python 服务。
- `modules/chat`：对话接口，将 Python 的 SSE 流式响应转发给前端。
- `services/ai-client.service.ts`：封装调用内网 Python FastAPI 的 HTTP 客户端。
- `database/`：TypeORM 存储用户、会话、消息元数据。

### ai-service（Python FastAPI，不对外暴露）
- 部署在内网，仅允许 NestJS 访问（网络隔离 + 内部 Token 校验）。
- `rag/`：文档解析、切片、向量化、检索。
- `llm/`：LLM 调用与流式生成（SSE）。
- `api/`：内部接口，只给 Nest 调用。

## 关键设计

1. **安全边界**：Python 服务不对外网暴露端口，Nest 是唯一入口；所有用户请求先经过鉴权、限流与参数校验。
2. **流式转发**：对话采用 SSE。Nest 使用 `rxjs` + `HttpService`（axios `responseType: stream`）把 Python 的 SSE 逐段转发给浏览器，保持 token 级实时输出。
3. **文件上传**：前端 → Nest 用 `multipart/form-data`，Nest 校验类型/大小后以流的方式转发到 Python，避免在 Node 内存中缓存大文件。
4. **可替换向量库**：`rag/` 内通过抽象 `VectorStore` 接口对接 Milvus / Qdrant / pgvector，配置切换。
5. **配置管理**：统一使用环境变量（`.env`），Nest 侧由 `@nestjs/config` 加载，Python 侧由 `pydantic-settings` 加载。
