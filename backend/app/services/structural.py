import re


class StructuralAnalyzer:

    def __init__(self, text: str):
        self.text = text.strip()

    # -------------------------
    # Basic Statistics
    # -------------------------

    def character_count(self):
        return len(self.text)

    def word_count(self):
        return len(self.text.split())

    def paragraph_count(self):
        paragraphs = [p for p in self.text.split("\n") if p.strip()]
        return len(paragraphs)

    def sentence_count(self):
        sentences = re.split(r"[.!?]+", self.text)
        sentences = [s for s in sentences if s.strip()]
        return len(sentences)

    def average_sentence_length(self):
        if self.sentence_count() == 0:
            return 0

        return round(self.word_count() / self.sentence_count(), 2)

    def reading_time(self):
        minutes = max(1, round(self.word_count() / 200))
        return f"{minutes} min"

    # -------------------------
    # Opening Strength
    # -------------------------

    def opening_strength(self):

        first_para = self.text.split("\n")[0]

        if len(first_para.split()) > 45:
            return "Strong"

        if len(first_para.split()) > 25:
            return "Average"

        return "Weak"

    # -------------------------
    # Closing Strength
    # -------------------------

    def closing_strength(self):

        last_para = self.text.split("\n")[-1]

        if "thank" in last_para.lower():
            return "Strong"

        return "Average"

    # -------------------------
    # Paragraph Balance
    # -------------------------

    def paragraph_balance(self):

        paragraphs = [
            len(p.split())
            for p in self.text.split("\n")
            if p.strip()
        ]

        if len(paragraphs) <= 1:
            return "Poor"

        average = sum(paragraphs) / len(paragraphs)

        if max(paragraphs) - min(paragraphs) < average:
            return "Balanced"

        return "Needs Improvement"

    # -------------------------
    # Cliche Detection
    # -------------------------

    def detect_cliches(self):

        cliches = [

            "i have always been passionate",

            "since childhood",

            "dream university",

            "from a young age",

            "life changing",

            "make a difference",

            "ever since i was young"

        ]

        found = []

        lower = self.text.lower()

        for phrase in cliches:

            if phrase in lower:
                found.append(phrase)

        return found