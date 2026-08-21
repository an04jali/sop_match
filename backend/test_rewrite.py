from app.services.rewrite import ParagraphRewriter


paragraph = """
AI has always fascinated me. I want to study artificial intelligence
because I believe it can change the world.
"""


rewriter = ParagraphRewriter(
    paragraph=paragraph,
    dimension="Motivation"
)

result = rewriter.rewrite()

print("\nREWRITE RESULT\n")

print("Original:")
print(paragraph)

print("\nRewritten:")
print(result["rewritten_paragraph"])

print("\nReason:")
print(result["reason"])