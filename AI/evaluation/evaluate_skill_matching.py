"""
SkillBridge AI Skill Matching Evaluation

Evaluates hybrid skill matching against the ground-truth
evaluation dataset.
"""

from matching.matcher import hybrid_match
from evaluation.evaluation_dataset import EVALUATION_CASES


def evaluate_skill_matching():
    total_cases = len(EVALUATION_CASES)
    passed_cases = 0

    print("\n===== SKILL MATCHING EVALUATION =====\n")

    for case in EVALUATION_CASES:
        result = hybrid_match(
            case["candidate_skills"],
            case["job_skills"]
        )

        actual_matched = result["matched_skills"]
        actual_missing = result["missing_skills"]

        expected_matched = sorted(
            case["expected"]["matched_skills"]
        )
        expected_missing = sorted(
            case["expected"]["missing_skills"]
        )

        matched_correct = (
            actual_matched == expected_matched
        )

        missing_correct = (
            actual_missing == expected_missing
        )

        passed = (
            matched_correct
            and missing_correct
        )

        if passed:
            passed_cases += 1

        status = "PASS" if passed else "FAIL"

        print(f"{case['id']} - {case['description']}")
        print(f"  Status: {status}")
        print(f"  Expected matched: {expected_matched}")
        print(f"  Actual matched:   {actual_matched}")
        print(f"  Expected missing: {expected_missing}")
        print(f"  Actual missing:   {actual_missing}")
        print(f"  Hybrid score:     {result['hybrid_score']}")
        print()

    accuracy = (
        passed_cases / total_cases * 100
        if total_cases
        else 0.0
    )

    print("===== EVALUATION SUMMARY =====")
    print(f"Total cases: {total_cases}")
    print(f"Passed cases: {passed_cases}")
    print(f"Failed cases: {total_cases - passed_cases}")
    print(f"Skill matching accuracy: {accuracy:.2f}%")

    return accuracy


if __name__ == "__main__":
    evaluate_skill_matching()
