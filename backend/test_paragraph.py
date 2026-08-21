from app.services.paragraph import ParagraphAnalyzer


essay = """
My interest in computer science began when I built a simple
attendance management application for my school using Python.

During my undergraduate studies, I developed a strong foundation
in data structures, algorithms and database systems.

I now want to pursue advanced study in artificial intelligence
and build intelligent systems that solve real-world problems.
"""


analyzer = ParagraphAnalyzer(essay)

print("Paragraph Count:", analyzer.paragraph_count())

print("\nParagraphs:")

for i, paragraph in enumerate(analyzer.get_paragraphs()):

    print(f"\nParagraph {i + 1}:")
    print(paragraph)

print("\nParagraph Lengths:")
print(analyzer.paragraph_lengths())