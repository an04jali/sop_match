import json
from pathlib import Path

from app.services.gemini import generate


PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

DIMENSIONS = [
    "clarity",
    "specificity",
    "motivation",
    "programme_fit",
    "academic_readiness",
    "career_vision",
    "writing_quality"
]


class DimensionScorer:

    def __init__(self, essay: str):
        self.essay = essay

    def score_all(self):

        prompt_file = PROMPTS_DIR / "combined.txt"

        if not prompt_file.exists():
            raise FileNotFoundError(
                f"Prompt not found: {prompt_file}"
            )

        prompt = prompt_file.read_text(
            encoding="utf-8"
        )

        full_prompt = f"""
{prompt}

STUDENT SOP:

{self.essay}
"""

        print("\nScoring all dimensions (single call)...")

        try:
            response = generate(full_prompt)

            response = response.strip()

            if response.startswith("```"):
                response = response.replace("```json", "")
                response = response.replace("```", "")
                response = response.strip()

            parsed = json.loads(response)

            results = {}

            for dimension in DIMENSIONS:

                if dimension in parsed:
                    results[dimension] = parsed[dimension]
                else:
                    results[dimension] = {
                        "dimension": dimension,
                        "score": None,
                        "evidence": [],
                        "reason": "Dimension missing from model response."
                    }

            return results

        except Exception as e:

            print("Failed: combined scoring")
            print(e)

            return {
                dimension: {
                    "dimension": dimension,
                    "score": None,
                    "evidence": [],
                    "reason": "Scoring failed."
                }
                for dimension in DIMENSIONS
            }

    def overall_score(self, results):

        scores = []

        for dimension, result in results.items():

            score = result.get("score")

            if score is not None:
                scores.append(score)

        if not scores:
            return 0

        return round(sum(scores) / len(scores), 2)

    def weakest_dimension(self, results):

        valid_results = {
            dimension: result
            for dimension, result in results.items()
            if result.get("score") is not None
        }

        if not valid_results:
            return None

        weakest = min(
            valid_results.items(),
            key=lambda item: item[1]["score"]
        )

        return weakest[0]