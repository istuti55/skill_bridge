MODEL_NAME = "BAAI/bge-small-en-v1.5"

_model = None


def _get_model():
    """Load the embedding model once, the first time it is needed."""
    global _model
    if _model is None:
        # Imported here so Django commands (check, migrate, createsuperuser)
        # start fast and don't use RAM for the model.
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def create_embedding(text: str):
    embedding = _get_model().encode(
        text,
        normalize_embeddings=True
    )

    return embedding