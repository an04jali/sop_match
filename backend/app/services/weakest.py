class WeakestParagraphFinder:

    def __init__(self, essay: str):
        self.essay = essay

    def get_paragraphs(self):

        return [
            paragraph.strip()
            for paragraph in self.essay.split("\n\n")
            if paragraph.strip()
        ]

    def find(self, evidence):

        paragraphs = self.get_paragraphs()

        # No evidence available
        if not evidence:
            return None

        # Check every paragraph against every evidence quote
        for index, paragraph in enumerate(paragraphs):

            paragraph_lower = paragraph.lower()

            for quote in evidence:

                if not quote:
                    continue

                quote_clean = quote.strip().strip('"').strip("'")
                quote_lower = quote_clean.lower()

                # Exact/partial evidence match
                if quote_lower in paragraph_lower:

                    return {
                        "paragraph_number": index + 1,
                        "paragraph": paragraph,
                        "evidence": quote_clean
                    }

        # Fallback:
        # If evidence doesn't exactly match the paragraph,
        # find the paragraph containing the most words from evidence.

        best_paragraph = None
        best_score = 0
        best_evidence = ""

        for index, paragraph in enumerate(paragraphs):

            paragraph_words = set(
                paragraph.lower().split()
            )

            for quote in evidence:

                if not quote:
                    continue

                quote_clean = quote.strip().strip('"').strip("'")

                quote_words = set(
                    quote_clean.lower().split()
                )

                if not quote_words:
                    continue

                common_words = paragraph_words.intersection(
                    quote_words
                )

                score = len(common_words) / len(quote_words)

                if score > best_score:

                    best_score = score
                    best_paragraph = {
                        "paragraph_number": index + 1,
                        "paragraph": paragraph,
                        "evidence": quote_clean
                    }
                    best_evidence = quote_clean

        # Only return fallback if there is a reasonable match
        if best_paragraph and best_score >= 0.3:
            return best_paragraph

        return None