"""LLM 服务：RAG 检索 + 流式生成，输出 SSE 事件流。

骨架实现：generate_stream 目前是占位回声，接入真实 LLM 时
用 openai / anthropic 等 SDK 的 stream 接口替换即可。
"""
