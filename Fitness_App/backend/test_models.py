import httpx
import asyncio

async def list_models():
    api_key = 'AIzaSyC-M6nc1W0TeBGbk1eyVo5B9XBtWE_1JnY'
    url = f'https://generativelanguage.googleapis.com/v1beta/models?key={api_key}'
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        if 'models' in data:
            model_names = [m['name'] for m in data['models']]
            print('\n'.join(model_names))
        else:
            print("Response:", data)

if __name__ == "__main__":
    asyncio.run(list_models())
