import numpy as np


resume = np.load("output/resume_embedding.npy")
job = np.load("output/job_embedding.npy")


similarity = np.dot(resume, job) / (
    np.linalg.norm(resume) *
    np.linalg.norm(job)
)


score = similarity * 100

print(f"Resume Match Score: {score:.2f}%")