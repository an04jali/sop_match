from app.services.gemini import generate


class ParagraphRewriter:

    def __init__(self, paragraph: str, dimension: str):

        self.paragraph = paragraph
        self.dimension = dimension

    def rewrite(self):

        prompt = f"""
You are an expert Statement of Purpose editor.

Rewrite ONLY the paragraph provided below.

The paragraph is currently weak in this dimension:

{self.dimension}

Your goal is to improve that specific weakness while preserving
the student's original meaning, experiences, voice, and facts.

Do NOT invent:
- achievements
- projects
- research
- universities
- jobs
- statistics
- experiences
- personal details

Do NOT rewrite the entire SOP.

Rewrite ONLY this paragraph.

Return ONLY valid JSON in this format:

{{
    "rewritten_paragraph": "Improved paragraph here",
    "reason": "Short explanation of what was improved."
}}

ORIGINAL PARAGRAPH:

{self.paragraph}
"""

        response = generate(prompt)

        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        import json

        return json.loads(response)