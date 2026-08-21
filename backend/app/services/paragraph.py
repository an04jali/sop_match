class ParagraphAnalyzer:

    def __init__(self, text: str):
        self.text = text

    def get_paragraphs(self):

        paragraphs = [
            p.strip()
            for p in self.text.split("\n")
            if p.strip()
        ]

        return paragraphs

    def paragraph_count(self):
        return len(self.get_paragraphs())

    def get_paragraph(self, index: int):

        paragraphs = self.get_paragraphs()

        if index < 0 or index >= len(paragraphs):
            return None

        return paragraphs[index]

    def paragraph_lengths(self):

        paragraphs = self.get_paragraphs()

        return [
            len(paragraph.split())
            for paragraph in paragraphs
        ]

    def longest_paragraph(self):

        paragraphs = self.get_paragraphs()

        if not paragraphs:
            return None

        return max(
            paragraphs,
            key=lambda paragraph: len(paragraph.split())
        )

    def shortest_paragraph(self):

        paragraphs = self.get_paragraphs()

        if not paragraphs:
            return None

        return min(
            paragraphs,
            key=lambda paragraph: len(paragraph.split())
        )