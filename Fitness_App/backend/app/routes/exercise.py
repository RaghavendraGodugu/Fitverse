from fastapi import APIRouter, HTTPException, Query
from app.services.exercise_service import exercise_service

router = APIRouter()

@router.get("/")
@router.get("")
async def get_exercises(limit: int = Query(default=1500)):
    try:
        data = await exercise_service.get_all_exercises(limit)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exercises")

@router.get("/bodyPart/{part}")
async def get_exercises_by_body_part(part: str, limit: int = Query(default=50)):
    try:
        data = await exercise_service.get_exercises_by_body_part(part, limit)
        return {"success": True, "data": data}
    except Exception as e:
        print(f"Error fetching exercises by body part {part}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch exercises by body part")
