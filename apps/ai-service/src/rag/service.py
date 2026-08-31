"""RAG 服务：文档解析、切片、向量化、检索。

骨架实现：向量入库/检索接口留空，接入真实向量库时实现 VectorStore 即可。
"""


class knowledgeBaseService:
  def __init__(self) -> None:
    pass

  async def ingest(self, filename: str, content: bytes, collection: str) -> None:
    pass

  async def list_documents(self, collection: str) -> list[str]:
    pass

  async def delete(self, doc_id: str) -> None:
    pass

  async def retrieve(self, query: str, top_k: int = 5) -> list[str]:
    pass
