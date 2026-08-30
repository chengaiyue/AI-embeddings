# 接口文档

## 对外接口（NestJS，`http://localhost:3000`）

所有接口前缀 `/api`，除登录外均需 `Authorization: Bearer <jwt>`。

### 认证

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/login` | 登录，返回 JWT |

```json
// POST /api/auth/login
{ "username": "alice", "password": "******" }
// 200
{ "accessToken": "eyJhbGci...", "user": { "id": 1, "username": "alice" } }
```

### RAG 数据上传

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/rag/documents` | 上传文档（multipart/form-data），入库并向量化 |
| GET | `/api/rag/documents` | 文档列表（含切片数、处理状态） |
| DELETE | `/api/rag/documents/:id` | 删除文档及其向量 |

```bash
curl -X POST http://localhost:3000/api/rag/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./knowledge.pdf" \
  -F "collection=default"
```

```json
// 201
{ "id": "doc_9f2c", "filename": "knowledge.pdf", "status": "processing", "chunks": 0 }
```

### AI 对话（SSE 流式）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/chat/sessions` | 创建会话 |
| GET | `/api/chat/sessions` | 会话列表 |
| POST | `/api/chat/completions` | 发送消息，SSE 流式返回回答 |

请求：

```json
// POST /api/chat/completions
{ "sessionId": "sess_1", "message": "这份文档讲了什么？", "topK": 5 }
```

SSE 响应（`Content-Type: text/event-stream`）：

```
event: message
data: {"type":"sources","sources":[{"docId":"doc_9f2c","score":0.83,"snippet":"..."}]}

event: message
data: {"type":"delta","content":"这份文档"}

event: message
data: {"type":"delta","content":"主要介绍了..."}

event: message
data: {"type":"done","messageId":"msg_42"}
```

## 内部接口（Python FastAPI，`http://ai-service:8000`，仅内网）

所有请求需携带内部令牌：`X-Internal-Token: <AI_SERVICE_TOKEN>`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/internal/rag/documents` | 接收 Nest 转发的文件，解析→切片→向量化 |
| GET | `/internal/rag/documents` | 文档列表 |
| DELETE | `/internal/rag/documents/{doc_id}` | 删除文档及向量 |
| POST | `/internal/chat/completions` | 检索 + LLM 生成，SSE 流式返回 |
| GET | `/health` | 健康检查 |

`POST /internal/chat/completions` 请求：

```json
{ "sessionId": "sess_1", "message": "这份文档讲了什么？", "topK": 5, "history": [{"role":"user","content":"..."}] }
```

响应为 SSE，事件格式与对外接口一致（Nest 原样转发）。

## 错误格式（Nest 统一）

```json
{ "statusCode": 400, "message": "文件类型不支持", "error": "Bad Request", "timestamp": "2026-08-30T12:00:00.000Z", "path": "/api/rag/documents" }
```
