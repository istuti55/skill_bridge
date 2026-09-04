from matching.education_matcher import education_match


candidate_education = [
    "Bachelor of Engineering in Computer Engineering"
]

required_education = [
    "Bachelor of Engineering Computer Engineering"
]


score = education_match(
    candidate_education,
    required_education
)

print("Education Score:", score)