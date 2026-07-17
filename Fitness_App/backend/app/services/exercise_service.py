import os
import httpx
from typing import List, Dict, Any

class ExerciseService:
    def __init__(self):
        self.base_url = 'https://wger.de/api/v2'
        # Fallback to key in original env if not set
        self.token = os.getenv('WGER_API_KEY') or 'e6475225bae4c13a2b5435d5ff5e345a9905196e'

    def map_wger_exercise(self, item: Dict[str, Any]) -> Dict[str, Any]:
        translations = item.get('translations', []) or []
        translation = next((t for t in translations if t.get('language') == 2), None)
        if not translation and translations:
            translation = translations[0]
        
        name = translation.get('name') if translation else None
        if not name:
            name = f"Exercise {item.get('id')}"

        muscles = item.get('muscles', []) or []
        target = "general"
        if muscles:
            target = muscles[0].get('name_en') or muscles[0].get('name') or "general"

        category = item.get('category') or {}
        body_part = (category.get('name') or "full body").lower()

        # Convert Wger categories to exercisedb equivalents for frontend compatibility
        if body_part == 'arms':
            body_part = 'lower arms'
        elif body_part == 'legs':
            body_part = 'upper legs'
        elif body_part == 'calves':
            body_part = 'lower legs'
        elif body_part == 'abs':
            body_part = 'waist'

        equipment_list = item.get('equipment', []) or []
        equipment = "body weight"
        if equipment_list:
            equipment = equipment_list[0].get('name') or "body weight"

        images = item.get('images', []) or []
        gif_url = None
        if images and images[0].get('image'):
            gif_url = images[0].get('image')
            if gif_url and not gif_url.startswith('http'):
                gif_url = 'https://wger.de' + gif_url
        else:
            gif_url = "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80"

        return {
            "id": str(item.get('id')),
            "name": name.lower(),
            "target": target.lower(),
            "bodyPart": body_part,
            "equipment": equipment.lower(),
            "gifUrl": gif_url
        }

    async def get_all_exercises(self, limit: int = 300) -> List[Dict[str, Any]]:
        headers = {
            'Authorization': f'Token {self.token}',
            'Accept': 'application/json'
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/exerciseinfo/?language=2&limit={limit}", headers=headers)
                response.raise_for_status()
                results = response.json().get('results', [])
                return [self.map_wger_exercise(item) for item in results]
        except Exception as e:
            status = None
            detail = str(e)
            if isinstance(e, httpx.HTTPStatusError):
                status = e.response.status_code
                try:
                    detail = e.response.json().get('detail') or e.response.text
                except Exception:
                    detail = e.response.text
            print('[exercises] Wger API request failed:', status or '', detail)
            return self.get_mock_exercises('api_error')

    async def get_exercises_by_body_part(self, body_part: str, limit: int = 50) -> List[Dict[str, Any]]:
        headers = {
            'Authorization': f'Token {self.token}',
            'Accept': 'application/json'
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/exerciseinfo/?language=2&limit=300", headers=headers)
                response.raise_for_status()
                results = response.json().get('results', [])
                mapped = [self.map_wger_exercise(item) for item in results]
                filtered = [e for e in mapped if body_part.lower() in e['bodyPart'].lower()]
                return filtered[:limit]
        except Exception as e:
            print('[exercises] Wger API bodyPart request failed:', str(e))
            return self.get_mock_exercises('api_error')

    def get_mock_exercises(self, reason: str = 'missing_key') -> List[Dict[str, Any]]:
        label = 'Mock Data (Wger Failed)'
        return [
            { "id": "1", "name": f"barbell bench press ({label})", "bodyPart": "chest", "equipment": "barbell", "target": "pectorals", "gifUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" },
            { "id": "2", "name": "squat (mock)", "bodyPart": "upper legs", "equipment": "barbell", "target": "quads", "gifUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
            { "id": "3", "name": "dumbbell curl (mock)", "bodyPart": "lower arms", "equipment": "dumbbell", "target": "biceps", "gifUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80" },
            { "id": "4", "name": "lat pulldown (mock)", "bodyPart": "back", "equipment": "cable", "target": "lats", "gifUrl": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80" }
        ]

exercise_service = ExerciseService()
