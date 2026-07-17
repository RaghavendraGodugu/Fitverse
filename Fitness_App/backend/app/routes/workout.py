from fastapi import APIRouter

router = APIRouter()

@router.get("/")
@router.get("")
def get_workouts():
    return {"message": "Fetch all workouts for user placeholder"}

@router.post("/")
@router.post("")
def create_workout():
    return {"message": "Create new workout for user placeholder"}

@router.put("/{id}")
def update_workout(id: str):
    return {"message": f"Update workout {id} placeholder"}
