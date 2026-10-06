"""
SkillBridge AI Evaluation Regression Runner

Runs all Milestone 11 evaluation suites and reports
whether the current AI behavior remains within the
established quality baselines.

Also saves the evaluation results to a JSON file
for later comparison and regression tracking.
"""

import json
from datetime import datetime
from pathlib import Path

from evaluation.evaluate_skill_matching import (
    evaluate_skill_matching,
)
from evaluation.evaluate_skill_gap import (
    evaluate_skill_gap,
)
from evaluation.evaluate_career_recommendation import (
    evaluate_career_recommendations,
)
from evaluation.evaluate_edge_cases import (
    evaluate_edge_cases,
)


MINIMUM_THRESHOLDS = {
    "Skill Matching": 80.0,
    "Skill Gap": 100.0,
    "Career Recommendation": 100.0,
    "Edge Case & Reliability": 100.0,
}


RESULTS_FILE = (
    Path(__file__).resolve().parent
    / "evaluation_results.json"
)


def save_results(results, all_passed):
    """
    Save evaluation results to a JSON file.
    """

    report = {
        "timestamp": datetime.now().isoformat(
            timespec="seconds"
        ),
        "results": {},
        "overall_status": (
            "PASS"
            if all_passed
            else "FAIL"
        ),
    }

    for name, score in results.items():
        threshold = MINIMUM_THRESHOLDS[name]

        report["results"][name] = {
            "score": round(score, 2),
            "minimum_threshold": threshold,
            "status": (
                "PASS"
                if score >= threshold
                else "FAIL"
            ),
        }

    with open(
        RESULTS_FILE,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            report,
            file,
            indent=4,
        )

    print(
        f"\nEvaluation results saved to: "
        f"{RESULTS_FILE}"
    )


def run_all_evaluations():
    print("\n")
    print("=" * 60)
    print("SKILLBRIDGE AI EVALUATION REGRESSION TEST")
    print("=" * 60)

    results = {}

    print(
        "\n[1/4] Running skill matching evaluation..."
    )
    results["Skill Matching"] = (
        evaluate_skill_matching()
    )

    print(
        "\n[2/4] Running skill gap evaluation..."
    )
    results["Skill Gap"] = evaluate_skill_gap()

    print(
        "\n[3/4] Running career recommendation evaluation..."
    )
    results["Career Recommendation"] = (
        evaluate_career_recommendations()
    )

    print(
        "\n[4/4] Running edge case evaluation..."
    )
    results["Edge Case & Reliability"] = (
        evaluate_edge_cases()
    )

    print("\n")
    print("=" * 60)
    print("REGRESSION TEST SUMMARY")
    print("=" * 60)

    all_passed = True

    for name, score in results.items():
        threshold = MINIMUM_THRESHOLDS[name]

        passed = score >= threshold

        status = "PASS" if passed else "FAIL"

        if not passed:
            all_passed = False

        print(
            f"{name}: "
            f"{score:.2f}% "
            f"(minimum {threshold:.2f}%) "
            f"[{status}]"
        )

    print("\n" + "=" * 60)

    if all_passed:
        print("REGRESSION TEST: PASS")
        print(
            "All evaluation categories meet their "
            "minimum quality thresholds."
        )
    else:
        print("REGRESSION TEST: FAIL")
        print(
            "One or more evaluation categories are "
            "below their minimum quality thresholds."
        )

    print("=" * 60)

    save_results(
        results,
        all_passed,
    )

    return all_passed


if __name__ == "__main__":
    run_all_evaluations()