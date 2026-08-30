"""LLM 服务：RAG 检索 + 流式生成，输出 SSE 事件流。

骨架实现：generate_stream 目前是占位回声，接入真实 LLM 时
用 openai / anthropic 等 SDK 的 stream 接口替换即可。
"""

import json
from collections.abc import AsyncIterator
from typing import Any

from src.rag.service import RagService

SYSTEM_PROMPT = (
    "你是企业知识库助手。请根据检索到的知识库内容回答用户问题；"
    "如果知识库中没有相关内容，请如实说明。"
)


def sse_event(payload: dict[str, Any]) -> str:
    return f"event: message\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


async def stream_chat_answer(
    message: str,
    top_k: int,
    history: list[dict[str, str]],
    rag_service: RagService,
) -> AsyncIterator[str]:
    # 1. 知识库检索，先推送引用来源
    sources = await rag_service.retrieve(message, top_k=top_k)
    yield sse_event(
        {
            "type": "sources",
            "sources": [{"docId": s.doc_id, "score": s.score, "snippet": s.snippet} for s in sources],
        }
    )

    # 2. 流式生成回答
    context = "\n\n".join(f"[{s.doc_id}] {s.snippet}" for s in sources)
    # TODO: 接入真实 LLM，例如：
    #   client = AsyncOpenAI(api_key=settings.llm_api_key)
    #   stream = await client.chat.completions.create(
    #       model=settings.llm_model, stream=True,
    #       messages=[{"role": "system", "content": SYSTEM_PROMPT}, *history,
    #                 {"role": "user", "content": f"参考资料：\n{context}\n\n问题：{message}"}])
    #   async for chunk in stream:
    #       delta = chunk.choices[0].delta.content
    #       if delta:
    #           yield sse_event({"type": "delta", "content": delta})
    answer = f"[骨架模式] 已收到问题：{message}（检索到 {len(sources)} 条引用，LLM 未接入）"
    for i in range(0, len(answer), 8):
        yield sse_event({"type": "delta", "content": answer[i : i + 8]})

    # 3. 结束
    yield sse_event({"type": "done", "messageId": f"msg_{int(__import__('time').time() * 1000)}"})
