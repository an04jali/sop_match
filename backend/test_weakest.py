from app.services.weakest import WeakestParagraphFinder


essay = """
My interest in computer science began when I built a simple attendance
management application for my school using Python.

During my undergraduate studies, I developed a strong foundation
in data structures, algorithms and database systems.

AI has always fascinated me. I want to study artificial intelligence
because I believe it can change the world.
"""


evidence = [
    "AI has always fascinated me."
]


finder = WeakestParagraphFinder(essay)

result = finder.find(evidence)

print("\nWEAKEST PARAGRAPH\n")

if result:

    print("Paragraph:", result["paragraph_number"])

    print("Evidence:", result["evidence"])

    print("Text:")
    print(result["paragraph"])

else:

    print("No matching paragraph found.")