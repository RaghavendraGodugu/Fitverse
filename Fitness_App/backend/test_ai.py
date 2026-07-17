import os
import sys
import asyncio
import json
from dotenv import load_dotenv

# Ensure the backend root is in sys.path so 'app' can be imported when running this script directly
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

load_dotenv()

from app.services.ai_service import ai_service

async def test():
    try:
        queries = [
            "I want to build bigger arms",
            "Explain proper deadlift form",
            "Suggest a post-workout meal"
        ]
        for query in queries:
            print(f"\n--- Testing Query: '{query}' ---")
            res = await ai_service.generate_response(query, "123")
            print("Response:", json.dumps(res, indent=2))
    except Exception as e:
        print("Crash:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
