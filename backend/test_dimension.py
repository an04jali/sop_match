from app.services.dimensions import DimensionScorer


essay = """
My interest in computer science began when I built a simple
attendance management application for my school using Python.

During my undergraduate studies, I developed a strong foundation
in data structures, algorithms and database systems.

I now want to pursue advanced study in artificial intelligence
and build intelligent systems that solve real-world problems.
"""


scorer = DimensionScorer(essay)

results = scorer.score_all()

print("\nDRAFTSMAN RESULTS\n")

for dimension, result in results.items():

    print(f"\n--- {dimension.upper()} ---")

    print("Score:", result["score"])

    print("Evidence:")

    for evidence in result["evidence"]:
        print("-", evidence)

    print("Reason:", result["reason"])


overall = scorer.overall_score(results)

weakest = scorer.weakest_dimension(results)

print("\n==============================")
print("DRAFTSMAN SUMMARY")
print("==============================")

print("Overall Score:", overall, "/ 5")
print("Weakest Dimension:", weakest)