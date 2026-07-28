from sentence_transformers import SentenceTransformer
from pathlib import Path
import numpy as np


model = SentenceTransformer("BAAI/bge-small-en-v1.5")


def create_embedding(text):
    embedding = model.encode(text)
    return embedding


if __name__ == "__main__":

    resume_file = Path("sample_resumes/Resume.pdf")

    # Use your extracted resume text here
    text = """
    Python developer with experience in React, FastAPI,
    SQL, Docker, AWS and backend development.
    """

    embedding = create_embedding(text)

    print(type(embedding))
    print(embedding.shape)

    # Save vector
    np.save("output/resume_embedding.npy", embedding)

    print("✅ Embedding saved")