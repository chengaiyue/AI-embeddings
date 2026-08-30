from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """配置全部来自环境变量（支持 .env），与 nest-backend 的 .env 保持一致"""

    # 服务
    host: str = "0.0.0.0"
    port: int = 8000

    # 内网令牌：所有 /internal/* 请求必须携带 X-Internal-Token
    internal_token: str = "dev-internal-token"

    # 向量库（示例默认用本地文件向量库；可切换 qdrant/milvus/pgvector）
    vector_store: str = "local"
    vector_store_url: str = "http://localhost:6333"
    embedding_model: str = "text-embedding-3-small"
    embedding_api_key: str = ""

    # LLM
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"

    # RAG 切片参数
    chunk_size: int = 512
    chunk_overlap: int = 64

    model_config = {"env_file": ".env", "env_prefix": "AI_"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
