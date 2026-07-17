import os
# Import config to load environment variables first
import app.config

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ai import router as ai_router
from app.routes.workout import router as workout_router
from app.routes.exercise import router as exercise_router

app = FastAPI(title="Fitverse API", version="1.0.0")

# =========================
# 🔐 SECURITY & MIDDLEWARE
# =========================

# Helmet equivalent middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=15552000; includeSubDomains"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    return response

# Permissive CORS for local and production compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",  # Allows all origins with credentials, bypassing FastAPI * limitation
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# 🚀 ROUTES
# =========================
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
app.include_router(workout_router, prefix="/api/workouts", tags=["Workouts"])
app.include_router(exercise_router, prefix="/api/exercises", tags=["Exercises"])

# =========================
# ❤️ HEALTH CHECK
# =========================
@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "message": "Fitverse API is running 🚀"
    }

# =========================
# ⚙️ SERVER STARTUP LOGGING
# =========================
@app.on_event("startup")
def startup_event():
    port = os.getenv("PORT", "5001")
    print(f"🚀 Server running on port {port}")
    
    # Database notice (since MongoDB connection is skipped for Python)
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("⚠️ No MONGO_URI found in environment.")
    else:
        print("💡 Database Notice: Running purely in Python without MongoDB as requested.")
