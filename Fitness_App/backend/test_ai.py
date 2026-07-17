import os
import sys
import asyncio
import json
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

load_dotenv()

from app.services.ai_service import AIServiceError, ai_service

async def test():
    queries = [
        "I want to build bigger arms",
        "Give me a low budget diet plan for muscle gain",
        "Suggest a post-workout meal",
    ]
    for query in queries:
        print(f"\n--- Testing Query: '{query}' ---")
        try:
            res = await ai_service.generate_response(query, "123", user_profile={"goal": "Muscle Gain", "level": "Intermediate"})
            print("Response:", json.dumps(res, indent=2))
        except AIServiceError as error:
            print(f"AI Error [{error.code}]: {error.message}")

if __name__ == "__main__":
    asyncio.run(test())
