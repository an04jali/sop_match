from app.services.diff import TextDiff


original = """
AI has always fascinated me. I want to study artificial intelligence
because I believe it can change the world.
"""

revised = """
My interest in artificial intelligence has grown through my desire
to understand how intelligent systems can solve meaningful problems.
"""


diff = TextDiff()

result = diff.compare(original, revised)

print("\nWORD LEVEL DIFF\n")

for item in result:

    if item["type"] == "added":
        print("[ADDED]", item["word"])

    elif item["type"] == "removed":
        print("[REMOVED]", item["word"])

    else:
        print("[UNCHANGED]", item["word"])