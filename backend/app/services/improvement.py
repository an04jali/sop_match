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
"[University Name]" or "[Specific Course]".

If a name is "Not specified", keep the language general
and do not invent one.
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
                "error": (
                    f"AI service is temporarily unavailable ({e}). "
                    "Please try again in a moment."
                )
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

        target_context = f"""
TARGET UNIVERSITY:
{self.university or "Not specified"}

TARGET PROGRAM:
{self.program or "Not specified"}

IMPORTANT TARGET-SPECIFIC RULES:

- If TARGET UNIVERSITY is provided, use its exact name where relevant.
- If TARGET PROGRAM is provided, use its exact name where relevant.

- Never replace a provided university/program name with generic phrases
  such as "your university", "your Master's program", or "your institution".

- Do NOT invent course names, course codes, professors, labs, research
  groups, facilities, rankings, statistics, or other university-specific
  facts.

- If specific university information is not present in the original SOP,
  improve the programme-fit paragraph using ONLY the provided university
  and program names and the student's existing interests and experience.

- If university or program is "Not specified", keep the wording general.
"""

        prompt = f"""
You are an expert university Statement of Purpose editor.

Rewrite the ENTIRE Statement of Purpose below.

Your goal is to improve:

- Clarity
- Specificity
- Motivation
- Programme Fit
- Academic Readiness
- Career Vision
- Writing Quality

ORIGINAL SOP:
{self.essay}

{target_context}

STRICT RULES:

1. PRESERVE FACTS

- Preserve the student's original experiences, projects, technologies,
  achievements, education, goals, and personal details.
- Do NOT invent new achievements, projects, research, jobs, statistics,
  experiences, or qualifications.

2. PRESERVE VOICE

- Keep the student's authentic voice and meaning.
- Improve grammar, structure, precision, and flow without making the SOP
  sound artificially exaggerated.

3. UNIVERSITY AND PROGRAM

- Use the exact TARGET UNIVERSITY and TARGET PROGRAM names when relevant.
- Do NOT write "your Master's program" when a TARGET PROGRAM is provided.
- Do NOT write "your university" when a TARGET UNIVERSITY is provided.
- Do NOT invent faculty, laboratories, courses, course codes, research
  centers, rankings, or other institutional facts.

4. PROGRAMME FIT

- Strengthen the programme-fit paragraph using the student's existing
  technical interests and experience.
- Connect those interests naturally to the TARGET PROGRAM.
- Do not fabricate university-specific details.

5. LENGTH

- Keep the rewritten SOP roughly similar in length to the original.
- Do not unnecessarily add paragraphs or unrelated content.

6. OUTPUT

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in ```json.

Use exactly this format:

{{
    "improved_essay": "...",
    "changes_summary": [
        "...",
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
                "error": (
                    f"AI service is temporarily unavailable ({e}). "
                    "Please try again in a moment."
                )
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
                "improved_essay": response,
                "changes_summary": []
            }