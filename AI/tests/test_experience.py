from matching.experience_matcher import experience_match


candidate_experience = 2
required_experience = 3


score = experience_match(
    candidate_experience,
    required_experience
)


print("Experience Score:", score)