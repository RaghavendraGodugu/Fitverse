from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class FitnessLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class Goal(str, Enum):
    FAT_LOSS = "Fat loss"
    MUSCLE_GAIN = "Muscle gain"
    MAINTENANCE = "Maintenance"
    STRENGTH = "Strength"

class UserProfile(BaseModel):
    age: Optional[int] = None
    height: Optional[float] = None  # in cm
    weight: Optional[float] = None  # in kg
    gender: Optional[str] = None
    fitnessLevel: FitnessLevel = FitnessLevel.BEGINNER
    goal: Goal = Goal.MAINTENANCE
    dietaryPreference: Optional[str] = None

class User(BaseModel):
    name: str
    email: str
    password: str
    profile: Optional[UserProfile] = Field(default_factory=UserProfile)
    streak: int = 0
    lastActive: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
