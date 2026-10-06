from matching.embeddings import create_embedding


def test_embeddings():
    text = "Python Django FastAPI SQL Docker"
    embedding = create_embedding(text)
    assert embedding is not None
    assert len(embedding) > 0