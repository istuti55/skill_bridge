from parser import extract_text
from model import parse_resume
from job_parser import parse_job
from embeddings import create_embedding
from similarity import semantic_similarity
from matcher import match_candidate
from skill_gap import find_skill_gap
from recommender import recommend_career
from credibility import check_credibility


def analyze_resume(pdf_path, job_description):

    # Step 1
    resume_text = extract_text(pdf_path)

    # Step 2
    resume = parse_resume(resume_text)

    # Step 3
    job = parse_job(job_description)

    # Step 4
    resume_embedding = create_embedding(resume_text)
    job_embedding = create_embedding(job_description)

    # Step 5
    similarity = semantic_similarity(
        resume_embedding,
        job_embedding
    )

    # Step 6
    match = match_candidate(
        resume,
        job,
        similarity
    )

    # Step 7
    gap = find_skill_gap(
        resume,
        job
    )

    # Step 8
    career = recommend_career(
        resume,
        gap
    )

    # Step 9
    credibility = check_credibility(
        resume
    )

    return {
        "candidate": resume,
        "match": match,
        "skill_gap": gap,
        "career": career,
        "credibility": credibility
    }