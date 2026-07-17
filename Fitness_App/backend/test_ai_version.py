import os
import asyncio
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

async def test():
    api_key = os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel(model_name="gemini-flash-latest")
        result = await model.generate_content_async("hello")
        print("Success gemini-flash-latest:", result.text)
    except Exception as e:
        print("Crash gemini-flash-latest:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
