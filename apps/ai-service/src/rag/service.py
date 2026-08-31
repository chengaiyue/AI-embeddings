"""
RAG 服务：文档解析、切片、向量化、检索。
  使用数据库Chroma
"""

import os
from dotenv import load_dotenv
load_dotenv()

from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from langchain_text_splitter import RecursiveCharacterTextSplitter


SEPARATOR=[
  # 1.大段落、文档层级分隔（最高优先级）
  "\n\n\n",
  "\n\n",
  # 2.换行、markdown标题、分割线
  "\r\n\r\n",
  "\n",
  "\r\n",
  "---",
  "***",
  # 3.中文句子结束符号
  "。",
  "！",
  "？",
  "……",
  # 4.中文分句、标点
  "；",
  "：",
  "，",
  "、",
  # 5.英文句子结束
  ". ",
  "! ",
  "? ",
  # 6.英文分句
  "; ",
  ": ",
  ", ",
  # 7.空格兜底
  " ",
  # 兜底，必须保留，文本实在切不开时强制字符切割
  ""
]

class knowledgeBaseService:
  def __init__(self) -> None:

    
    
    self.embedding = OpenAIEmbeddings(
      model="doubao-embedding-vision",
      chunk_size=100,
      check_embedding_ctx_length=False, # 需要加这个参数，不然报错
      api_key=os.environ.get("EMBEDDING_MODEL_API_KEY"),
      base_url="https://ark.cn-beijing.volces.com/api/plan/v3",
    )

    self.Chroma = Chroma(
      embedding=self.embedding,
      persist_directory="../chroma_db",
    )

    self.splitter = RecursiveCharacterTextSplitter(
      chunk_size=600,
      chunk_overlap=60,
      length_function=len,
      separators = SEPARATOR
    )
    pass

  async def ingest(self, filename: str, content: bytes, collection: str) -> None:
    pass

  async def list_documents(self, collection: str) -> list[str]:
    pass

  async def delete(self, doc_id: str) -> None:
    pass

  async def retrieve(self, query: str, top_k: int = 5) -> list[str]:
    pass
