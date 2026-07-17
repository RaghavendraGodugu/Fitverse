import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test():
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url)
            json_data = res.json()
            if 'models' in json_data:
                print("Models:", [m['name'] for m in json_data['models']])
            else:
                print("Response:", json_data)
    except Exception as e:
        print("Crash:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
