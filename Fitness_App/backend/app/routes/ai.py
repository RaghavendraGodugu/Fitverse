from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_service import AIServiceError, ai_service

router = APIRouter()


class UserProfile(BaseModel):
    age: Optional[int] = None
    height: Optional[float | str] = None
    weight: Optional[float | str] = None
    goal: Optional[str] = None
    level: Optional[str] = None
    gender: Optional[str] = None
    diet: Optional[str] = None


class ChatRequest(BaseModel):
    query: str
    mode: Literal["coaching", "workout_plan"] = "coaching"
    userProfile: Optional[UserProfile] = None


def get_current_user():
    return {"id": "mock-user-123"}


@router.post("/chat")
@router.post("/chat/")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query is required")

    profile: Optional[dict[str, Any]] = None
    if request.userProfile:
        profile = request.userProfile.model_dump(exclude_none=True)

    try:
        ai_response = await ai_service.generate_response(
            query=request.query,
            user_id=user["id"],
            user_profile=profile,
            mode=request.mode,
        )
        return {"success": True, "source": "gemini", "data": ai_response}
    except AIServiceError as error:
        print(f"⚠️ [ai_service] {error.code}: {error.message}")
        raise HTTPException(
            status_code=error.status_code,
            detail={"error": error.message, "code": error.code},
        ) from error
    except Exception as error:
        print(f"Error in chat: {error}")
        raise HTTPException(status_code=500, detail=str(error)) from error
