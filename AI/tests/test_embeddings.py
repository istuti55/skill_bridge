from matching.embeddings import create_embedding


text = "Python Django FastAPI SQL Docker"

print("Creating embedding...")

embedding = create_embedding(text)

print("Embedding created.")
print("Dimensions:", len(embedding))
print("First values:", embedding[:5])