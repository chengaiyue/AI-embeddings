"""RAG 服务：文档解析、切片、向量化、检索。

骨架实现：向量入库/检索接口留空，接入真实向量库时实现 VectorStore 即可。
"""

import time
import uuid
from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class RagDocument:
    id: str
    filename: str
    status: str  # processing | ready | failed
    chunks: int
    collection: str
    createdAt: str = field(default_factory=lambda: str(int(time.time() * 1000)))


@dataclass
class RetrievedChunk:
    doc_id: str
    score: float
    snippet: str


class VectorStore(Protocol):
    """向量库抽象：可对接 qdrant / milvus / pgvector"""

    async def upsert(self, collection: str, doc_id: str, chunks: list[str], vectors: list[list[float]]) -> None: ...
    async def search(self, collection: str, query_vector: list[float], top_k: int) -> list[RetrievedChunk]: ...
    async def delete(self, collection: str, doc_id: str) -> None: ...


class RagService:
    def __init__(self) -> None:
        # 内存占位存储；接入真实向量库后移除
        self._documents: dict[str, RagDocument] = {}

    async def ingest(self, filename: str, content: bytes, collection: str) -> RagDocument:
        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        text = self._extract_text(filename, content)
        chunks = self._chunk_text(text)
        # TODO: vectors = await self.embedder.embed(chunks)
        # TODO: await self.vector_store.upsert(collection, doc_id, chunks, vectors)

        doc = RagDocument(id=doc_id, filename=filename, status="ready", chunks=len(chunks), collection=collection)
        self._documents[doc_id] = doc
        return doc

    async def list_documents(self, collection: str) -> list[RagDocument]:
        return [d for d in self._documents.values() if d.collection == collection]

    async def delete(self, doc_id: str) -> None:
        self._documents.pop(doc_id, None)
        # TODO: await self.vector_store.delete(collection, doc_id)

    async def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedChunk]:
        """按语义相似度检索知识库切片。"""
        # TODO: qv = await self.embedder.embed([query])[0]
        # TODO: return await self.vector_store.search("default", qv, top_k)
        return []

    def _extract_text(self, filename: str, content: bytes) -> str:
        """按文件类型提取文本。pdf/docx 接入 pypdf / python-docx 等解析器。"""
        lower = filename.lower()
        if lower.endswith((".txt", ".md")):
            return content.decode("utf-8", errors="replace")
        if lower.endswith(".pdf"):
            raise ValueError("PDF 解析器未接入（pip install pypdf 后在 _extract_text 实现）")
        if lower.endswith(".docx"):
            raise ValueError("DOCX 解析器未接入（pip install python-docx 后在 _extract_text 实现）")
        raise ValueError(f"不支持的文件类型：{filename}")

    def _chunk_text(self, text: str, max_len: int | None = None, overlap: int | None = None) -> list[str]:
        from src.config import get_settings

        settings = get_settings()
        max_len = max_len or settings.chunk_size
        overlap = overlap if overlap is not None else settings.chunk_overlap

        chunks: list[str] = []
        start = 0
        while start < len(text):
            chunks.append(text[start : start + max_len])
            start += max_len - overlap
        return [c.strip() for c in chunks if c.strip()]
