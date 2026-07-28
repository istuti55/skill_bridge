from sentence_transformers import SentenceTransformer
import numpy as np


model = SentenceTransformer("BAAI/bge-small-en-v1.5")


job_description = """
Looking for Python backend developer
with FastAPI, SQL, REST API and Docker experience.
"""


embedding = model.encode(job_description)

np.save(
    "output/job_embedding.npy",
    embedding
)

print("✅ Job embedding saved")