import os
import json
import asyncio
from typing import Dict, Any, Optional, Literal

from google import genai
from google.genai import types

ResponseMode = Literal["coaching", "workout_plan"]

COACHING_SCHEMA = {
    "type": "object",
    "properties": {
        "advice": {"type": "string"},
        "reason": {"type": "string"},
        "actionPlan": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["advice", "reason", "actionPlan"],
}

WORKOUT_PLAN_SCHEMA = {
    "type": "object",
    "properties": {
        "schedule": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "dayName": {"type": "string"},
                    "focus": {"type": "string"},
                    "isRest": {"type": "boolean"},
                    "analysis": {"type": "string"},
                    "exercises": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["dayName", "focus", "isRest", "exercises"],
            },
        }
    },
    "required": ["schedule"],
}


class AIServiceError(Exception):
    def __init__(self, message: str, code: str = "AI_ERROR", status_code: int = 503):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


def build_user_context(profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    defaults = {
        "age": 28,
        "height": "180cm",
        "weight": "80kg",
        "goal": "Muscle Gain",
        "level": "Intermediate",
        "gender": "Male",
        "diet": "None",
        "last_7_days_summary": "No recent workout data available.",
    }
    if not profile:
        return defaults

    merged = {**defaults, **{k: v for k, v in profile.items() if v is not None and v != ""}}

    if isinstance(merged.get("height"), (int, float)):
        merged["height"] = f"{merged['height']}cm"
    if isinstance(merged.get("weight"), (int, float)):
        merged["weight"] = f"{merged['weight']}kg"

    return merged


class AIService:
    def __init__(self):
        self._client: Optional[genai.Client] = None
        self._model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    def _get_client(self) -> genai.Client:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key in ("YOUR_GEMINI_API_KEY_HERE", "your_gemini_api_key"):
            raise AIServiceError(
                "Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env "
                "(get a key at https://aistudio.google.com/apikey).",
                code="MISSING_API_KEY",
                status_code=503,
            )

        if self._client is None:
            self._client = genai.Client(api_key=api_key)

        return self._client

    def build_coaching_prompt(self, user_context: Dict[str, Any], query: str) -> str:
        return f"""You are an elite certified fitness coach and nutrition expert.

User Profile:
- Age: {user_context.get('age')}
- Height: {user_context.get('height')}
- Weight: {user_context.get('weight')}
- Goal: {user_context.get('goal')}
- Fitness Level: {user_context.get('level')}
- Gender: {user_context.get('gender', 'Not specified')}
- Diet preference: {user_context.get('diet', 'None')}

Workout History (Last 7 Days):
{user_context.get('last_7_days_summary')}

User Query:
"{query}"

Instructions:
- Answer the user's specific question directly — do not give generic greetings or unrelated advice.
- Give short, actionable, personalized advice based on their profile and goal.
- Be motivating but realistic. Avoid unsafe recommendations.
- If they ask about diet/nutrition on a budget, suggest affordable whole foods (eggs, rice, lentils, chicken, oats, etc.).
- Output strictly as JSON with keys: advice, reason, actionPlan (array of 2-4 steps). No markdown."""

    def build_workout_plan_prompt(self, user_context: Dict[str, Any], query: str) -> str:
        return f"""You are an elite certified fitness coach creating a personalized weekly workout plan.

User Profile:
- Age: {user_context.get('age')}
- Height: {user_context.get('height')}
- Weight: {user_context.get('weight')}
- Goal: {user_context.get('goal')}
- Fitness Level: {user_context.get('level')}
- Gender: {user_context.get('gender', 'Not specified')}

Request:
{query}

Instructions:
- Create a 7-day schedule from Monday to Sunday.
- Match workout frequency and intensity to the user's goal and level.
- Rest days: set isRest=true, exercises=[], focus="Rest Day", and include recovery analysis.
- Use common exercise names that exist in gym databases.
- Output strictly as JSON with a "schedule" array of 7 day objects. No markdown."""

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)

    async def generate_response(
        self,
        query: str,
        user_id: str,
        user_profile: Optional[Dict[str, Any]] = None,
        mode: ResponseMode = "coaching",
    ) -> Dict[str, Any]:
        user_context = build_user_context(user_profile)
        client = self._get_client()

        if mode == "workout_plan":
            prompt = self.build_workout_plan_prompt(user_context, query)
            schema = WORKOUT_PLAN_SCHEMA
        else:
            prompt = self.build_coaching_prompt(user_context, query)
            schema = COACHING_SCHEMA

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.7,
        )

        retries = 2
        last_error: Optional[Exception] = None

        while retries >= 0:
            try:
                response = await client.aio.models.generate_content(
                    model=self._model,
                    contents=prompt,
                    config=config,
                )

                if not response.text:
                    raise AIServiceError(
                        "Gemini returned an empty response. Please try again.",
                        code="EMPTY_RESPONSE",
                    )

                return self._parse_json_response(response.text)

            except AIServiceError:
                raise
            except json.JSONDecodeError as error:
                raise AIServiceError(
                    f"Failed to parse Gemini response as JSON: {error}",
                    code="INVALID_RESPONSE",
                ) from error
            except Exception as error:
                last_error = error
                err_msg = str(error)
                is_rate_limit = "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg

                if is_rate_limit and retries > 0:
                    retries -= 1
                    await asyncio.sleep(2.0)
                    continue

                if "403" in err_msg or "leaked" in err_msg.lower() or "PERMISSION_DENIED" in err_msg:
                    raise AIServiceError(
                        "Your Gemini API key is invalid or was revoked. Generate a new key at "
                        "https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env.",
                        code="INVALID_API_KEY",
                        status_code=503,
                    ) from error

                if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                    if "limit: 0" in err_msg:
                        raise AIServiceError(
                            "Your Gemini API key has no quota (likely revoked or expired). "
                            "Create a new key at https://aistudio.google.com/apikey and update backend/.env.",
                            code="QUOTA_EXCEEDED",
                            status_code=503,
                        ) from error
                    raise AIServiceError(
                        "Gemini rate limit reached. Please wait a minute and try again.",
                        code="RATE_LIMITED",
                        status_code=429,
                    ) from error

                if "404" in err_msg or "not found" in err_msg.lower():
                    raise AIServiceError(
                        f"Gemini model '{self._model}' is unavailable. "
                        f"Set GEMINI_MODEL in backend/.env (e.g. gemini-2.0-flash). Error: {err_msg}",
                        code="MODEL_NOT_FOUND",
                    ) from error

                raise AIServiceError(
                    f"Gemini API error: {err_msg}",
                    code="GEMINI_ERROR",
                ) from error

        raise AIServiceError(
            f"Gemini API rate limited after retries: {last_error}",
            code="RATE_LIMITED",
        )


ai_service = AIService()
