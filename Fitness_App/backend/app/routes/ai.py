from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.ai_service import ai_service

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

# Mock dependency simulating JWT auth middleware
def get_current_user():
    return {"id": "mock-user-123"}

@router.post("/chat")
@router.post("/chat/")
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query is required")
    try:
        ai_response = await ai_service.generate_response(request.query, user["id"])
        return {"success": True, "data": ai_response}
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
