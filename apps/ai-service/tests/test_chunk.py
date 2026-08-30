import pytest

from src.rag.service import RagService


@pytest.fixture
def service() -> RagService:
    return RagService()


def test_chunk_text_basic(service: RagService):
    text = "a" * 1000
    chunks = service._chunk_text(text, max_len=100, overlap=0)
    assert len(chunks) == 10
    assert all(len(c) <= 100 for c in chunks)


def test_chunk_text_overlap(service: RagService):
    chunks = service._chunk_text("abcdefgh", max_len=4, overlap=2)
    assert chunks[1].startswith(chunks[0][2:])


def test_chunk_text_empty(service: RagService):
    assert service._chunk_text("", max_len=10, overlap=0) == []


async def test_ingest_txt(service: RagService):
    doc = await service.ingest("notes.md", b"# hello world", "default")
    assert doc.status == "ready"
    assert doc.chunks == 1
    assert doc.id in {d.id for d in await service.list_documents("default")}


async def test_ingest_unsupported(service: RagService):
    with pytest.raises(ValueError, match="PDF"):
        await service.ingest("a.pdf", b"%PDF", "default")


async def test_delete(service: RagService):
    doc = await service.ingest("a.txt", b"content", "default")
    await service.delete(doc.id)
    assert await service.list_documents("default") == []
