"""
SkillBridge AI Skill Gap Evaluation

Evaluates skill-gap detection against the ground-truth
evaluation dataset.
"""

from intelligence.skill_gap import analyze_required_skill_gap
from evaluation.evaluation_dataset import EVALUATION_CASES


def evaluate_skill_gap():
    total_cases = len(EVALUATION_CASES)
    passed_cases = 0

    print("\n===== SKILL GAP EVALUATION =====\n")

    for case in EVALUATION_CASES:
        result = analyze_required_skill_gap(
            case["candidate_skills"],
            case["job_skills"]
        )

        actual_matched = sorted(result["matched_skills"])
        actual_missing = sorted(result["missing_skills"])

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
        print(f"  Gap percentage:   {result['skill_gap_percentage']}%")
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
    print(f"Skill gap accuracy: {accuracy:.2f}%")

    return accuracy


if __name__ == "__main__":
    evaluate_skill_gap()