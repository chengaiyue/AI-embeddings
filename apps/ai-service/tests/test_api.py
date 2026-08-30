"""内部接口行为测试：令牌校验、上传、SSE 事件流"""

import pytest
from fastapi.testclient import TestClient

from src.main import app

TOKEN = {"X-Internal-Token": "dev-internal-token"}


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health_public(client: TestClient):
    assert client.get("/health").json() == {"status": "ok"}


def test_requires_internal_token(client: TestClient):
    assert client.get("/internal/rag/documents").status_code == 401
    assert client.get("/internal/rag/documents", headers={"X-Internal-Token": "wrong"}).status_code == 401


def test_upload_and_list(client: TestClient):
    res = client.post(
        "/internal/rag/documents",
        headers=TOKEN,
        files={"file": ("hello.txt", b"hello world", "text/plain")},
        data={"collection": "default"},
    )
    assert res.status_code == 200
    doc = res.json()
    assert doc["status"] == "ready"

    res = client.get("/internal/rag/documents", headers=TOKEN)
    assert any(d["id"] == doc["id"] for d in res.json())


def test_chat_completions_sse(client: TestClient):
    with client.stream(
        "POST",
        "/internal/chat/completions",
        headers=TOKEN,
        json={"sessionId": "s1", "message": "测试问题"},
    ) as res:
        assert res.status_code == 200
        assert res.headers["content-type"].startswith("text/event-stream")
        body = "".join(res.iter_text())

    assert '"type": "sources"' in body or '"type":"sources"' in body
    assert '"type": "done"' in body or '"type":"done"' in body
