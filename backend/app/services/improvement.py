import json
from app.services.gemini import generate


class ImprovementService:
    def __init__(
        self,
        essay: str,
        weakest_dimension: str,
        weakest_paragraph: str,
        evidence: list[str],
        reason: str,
        university: str | None = None,
        program: str | None = None
    ):
        self.essay = essay
        self.weakest_dimension = weakest_dimension
        self.weakest_paragraph = weakest_paragraph
        self.evidence = evidence
        self.reason = reason
        self.university = university
        self.program = program

    def generate_improvement(self):

        target_context = ""

        if self.university or self.program:
            target_context = f"""
TARGET UNIVERSITY: {self.university or "Not specified"}
TARGET PROGRAM: {self.program or "Not specified"}

If the improved paragraph mentions the university or programme,
use the exact names above instead of generic placeholders like
"[University Name]" or "[Specific Course]". If a name is
"Not specified", keep the language general and do not invent one.
"""

        prompt = f"""
You are an expert university SOP editor.

Improve ONLY the weakest area of the student's SOP.

STUDENT SOP:
{self.essay}

WEAKEST DIMENSION:
{self.weakest_dimension}

WEAKEST PARAGRAPH:
{self.weakest_paragraph}

EVIDENCE:
{self.evidence}

REASON:
{self.reason}
{target_context}
Provide:
1. The main problem.
2. Why the paragraph is weak.
3. Specific actionable suggestions.
4. An improved version of the weakest paragraph.

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in ```json.

Use exactly this format:
{{
    "problem": "...",
    "why_weak": "...",
    "suggestions": [
        "...",
        "..."
    ],
    "improved_paragraph": "..."
}}
"""

        try:
            response = generate(prompt)
        except Exception as e:
            return {
                "problem": "",
                "why_weak": "",
                "suggestions": [],
                "improved_paragraph": "",
                "error": f"AI service is temporarily unavailable ({e}). Please try again in a moment."
            }

        response = response.strip()

        # Remove markdown code fences if Gemini adds them
        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            return {
                "problem": "AI returned an invalid JSON response.",
                "why_weak": "",
                "suggestions": [],
                "improved_paragraph": response
            }

    def generate_full_improvement(self):

        target_context = ""

        if self.university or self.program:
            target_context = f"""
TARGET UNIVERSITY: {self.university or "Not specified"}
TARGET PROGRAM: {self.program or "Not specified"}

If the rewritten SOP mentions the university or programme,
use the exact names above instead of generic placeholders like
"[University Name]" or "[Specific Course]". If a name is
"Not specified", keep the language general and do not invent one.
"""

        prompt = f"""
You are an expert university SOP editor.

Rewrite the ENTIRE Statement of Purpose below to improve it across
all dimensions (clarity, specificity, motivation, programme fit,
academic readiness, career vision, writing quality).

STRICT RULES:
- Preserve the student's original voice, tone, and personal details.
- Do NOT invent new experiences, achievements, or facts not present
  in the original SOP.
- Keep the overall structure and length roughly similar.
- Fix vague or generic language by making it more specific where
  the original SOP already provides enough detail to do so.
- Do not add fabricated university/programme details.

ORIGINAL SOP:
{self.essay}
{target_context}
Provide:
1. The fully rewritten SOP.
2. A short bullet list summarizing what was changed and why.

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in ```json.

Use exactly this format:
{{
    "improved_essay": "...",
    "changes_summary": [
        "...",
        "..."
    ]
}}
"""

        try:
            response = generate(prompt)
        except Exception as e:
            return {
                "improved_essay": "",
                "changes_summary": [],
                "error": f"AI service is temporarily unavailable ({e}). Please try again in a moment."
            }

        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        try:
            result = json.loads(response)
            return result
        except json.JSONDecodeError:
            return {
                "improved_essay": response,
                "changes_summary": []
            }