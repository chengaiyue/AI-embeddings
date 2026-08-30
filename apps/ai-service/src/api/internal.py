"""内部接口：仅给 nest-backend 调用（鉴权见 middleware.py）"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from src.llm.service import stream_chat_answer
from src.rag.service import RagService

internal_router = APIRouter(prefix="/internal", tags=["internal"])

rag_service = RagService()


@internal_router.post("/rag/documents")
async def upload_document(
    file: UploadFile = File(...),
    collection: str = Form("default"),
):
    """接收 Nest 转发的文档：解析 -> 切片 -> 向量化 -> 入库"""
    try:
        content = await file.read()
        doc = await rag_service.ingest(
            filename=file.filename or "unknown",
            content=content,
            collection=collection,
        )
        return doc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@internal_router.get("/rag/documents")
async def list_documents(collection: str = "default"):
    return await rag_service.list_documents(collection)


@internal_router.delete("/rag/documents/{doc_id}")
async def delete_document(doc_id: str):
    await rag_service.delete(doc_id)
    return {"deleted": doc_id}


@internal_router.post("/chat/completions")
async def chat_completions(payload: dict):
    """检索 + LLM 生成，SSE 流式返回。

    请求体：{ sessionId, message, topK?, history?: [{role, content}] }
    事件格式与 nest 对外接口一致，Nest 原样转发：
      {"type":"sources","sources":[...]} / {"type":"delta","content":"..."} / {"type":"done",...}
    """
    message = payload.get("message", "")
    if not message:
        raise HTTPException(status_code=422, detail="message 不能为空")

    top_k = int(payload.get("topK", 5))
    history = payload.get("history", [])

    return StreamingResponse(
        stream_chat_answer(message=message, top_k=top_k, history=history, rag_service=rag_service),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
