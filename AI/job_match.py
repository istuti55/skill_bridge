from sentence_transformers import SentenceTransformer
import numpy as np


model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def create_embedding(text):
    return model.encode(text)


def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (
        np.linalg.norm(vec1) *
        np.linalg.norm(vec2)
    )


if __name__ == "__main__":

    # Load resume embedding
    resume_embedding = np.load(
        "output/resume_embedding.npy"
    )

    # Enter job description
    job_description = input(
        "Enter job description: "
    )

    # Create job embedding
    job_embedding = create_embedding(
        job_description
    )

    # Calculate similarity
    score = cosine_similarity(
        resume_embedding,
        job_embedding
    )

    print("\n===== MATCH RESULT =====")
    print(
        f"Resume Match Score: {score*100:.2f}%"
    )