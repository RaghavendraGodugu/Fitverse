import os
import json
import asyncio
import google.generativeai as genai
from typing import Dict, Any, List

def get_mock_user_context() -> Dict[str, Any]:
    return {
        "age": 28,
        "height": "180cm",
        "weight": "80kg",
        "goal": "Muscle Gain",
        "level": "Intermediate",
        "last_7_days_summary": "3 workouts completed. Chest volume was high. Missed leg day."
    }

def get_fallback_ai_response(query: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Generates high-quality, query-specific mock coaching advice when the Gemini API is unavailable or rate-limited."""
    q = query.lower()
    
    # Default fallback advice
    advice = "Ensure you are focusing on progressive overload, consuming adequate protein, and getting 7-8 hours of quality sleep to optimize recovery."
    reason = f"Your current goal is {user_context.get('goal', 'Muscle Gain')}, and you are at the {user_context.get('level', 'Intermediate')} fitness level."
    action_plan = [
        "Track your workouts and aim to increase weight or reps gradually.",
        "Consume 1.6-2.2g of protein per kg of bodyweight daily.",
        "Stay hydrated by drinking at least 3-4 liters of water throughout the day."
    ]

    # Query-specific overrides
    if any(k in q for k in ["hello", "hi", "hey", "greetings", "sup", "yo"]):
        advice = f"Hello! I am your AI Coach. How can I help you today? We can design a plan or talk about training for your goal of {user_context.get('goal', 'Muscle Gain')}."
        reason = "Greeting response to initiate a training conversation."
        action_plan = [
            "Ask about specific exercise form (e.g. deadlift, squat, bench).",
            "Request custom nutrition or post-workout meal tips.",
            "Ask how to optimize your arm, leg, chest, back, or shoulder training."
        ]
    elif any(k in q for k in ["deadlift", "back", "row", "pullup", "lats", "pull", "dead-lift", "chin-up", "chinups"]):
        advice = "For proper deadlift form and back development, hinge at your hips, keep your spine neutral, pull your shoulder blades back (lats engaged), and pull the bar close to your shins."
        reason = "A solid posterior chain and back require hip hinging for deadlifts, vertical pulling for lats, and horizontal rowing for mid-back thickness."
        action_plan = [
            "Setup deadlifts with the barbell over your mid-foot, grip the bar, drop your hips slightly, pull the slack out of the bar, and drive through your heels.",
            "Perform 3 sets of Pull-ups or Lat Pulldowns (8-10 reps) focusing on pulling with your elbows to isolate the lats.",
            "Perform 3 sets of Chest-Supported or Bent-Over Barbell Rows (10-12 reps) to target the rhomboids and mid-traps."
        ]
    elif any(k in q for k in ["chest", "bench", "pec", "fly", "flies", "pushup"]):
        advice = "To build a stronger chest, focus on chest presses (flat/incline) and chest flies, ensuring you control the descent to stretch the pectorals."
        reason = "The pectoral muscles respond best to high mechanical tension at long muscle lengths."
        action_plan = [
            "Perform 4 sets of Bench Press or Dumbbell Press (8-10 reps).",
            "Perform 3 sets of Cable Chest Flies (12-15 reps) concentrating on the squeeze.",
            "Maintain a slight arch in your lower back and keep shoulder blades retracted."
        ]
    elif any(k in q for k in ["arm", "bicep", "tricep", "curl"]):
        advice = "To build bigger arms, focus on targeted tricep extensions (since triceps make up 60% of arm volume) and bicep curls, ensuring full range of motion."
        reason = "Targeted hypertrophy for arms requires direct isolation volume with controlled eccentric phases."
        action_plan = [
            "Perform 3 sets of Tricep Overhead Cable Extensions (12-15 reps).",
            "Perform 3 sets of Incline Dumbbell Bicep Curls (10-12 reps).",
            "Keep elbow position locked and avoid using momentum during lifts."
        ]
    elif any(k in q for k in ["leg", "squat", "calf", "calves", "quad", "hamstring", "glute"]):
        advice = "For complete leg development, prioritize compound movements like squats and Romanian deadlifts to target your quads, hamstrings, and glutes."
        reason = "Leg development requires high intensity and volume due to the size of the muscle groups involved."
        action_plan = [
            "Perform 4 sets of Barbell Squats (6-8 reps) with deep range of motion.",
            "Perform 3 sets of Romanian Deadlifts (10-12 reps) focusing on hip hinge.",
            "Incorporate standing or seated calf raises to target lower legs."
        ]
    elif any(k in q for k in ["shoulder", "delt", "press", "lateral", "ohp"]):
        advice = "For rounded, healthy shoulders, target all three deltoid heads (anterior, lateral, posterior), prioritizing overhead presses and dumbbell lateral raises."
        reason = "The shoulder joint is highly mobile and requires balanced development of all three heads to create a wide frame and prevent injury."
        action_plan = [
            "Perform 4 sets of Dumbbell or Barbell Overhead Press (8-10 reps) for anterior delts.",
            "Perform 4 sets of Dumbbell Lateral Raises (12-15 reps) to target the lateral head for shoulder width.",
            "Perform 3 sets of Face Pulls or Rear Delt Flies (15-20 reps) to target the posterior delts."
        ]
    elif any(k in q for k in ["diet", "eat", "food", "nutrition", "protein", "calorie", "meal", "recipe", "shake", "supplement", "carb", "fat", "breakfast", "lunch", "dinner", "snack", "smoothie", "pre-workout", "post-workout"]):
        advice = "Prioritize a post-workout meal or shake containing 30-40g of high-quality protein (like whey or chicken breast) paired with 50-80g of fast-digesting carbohydrates (like rice, oats, or bananas) to speed up recovery."
        reason = "Consuming protein post-workout stimulates muscle protein synthesis, while fast carbs replenish depleted glycogen stores immediately."
        action_plan = [
            "Option 1 (Shake): Mix 1-2 scoops of whey protein with 1 banana and oats.",
            "Option 2 (Meal): Eat 150g of grilled chicken breast or fish with 1.5 cups of white jasmine rice and broccoli.",
            "Drink plenty of water and keep fat intake low immediately post-workout to ensure fast nutrient digestion."
        ]
    elif any(k in q for k in ["cardio", "run", "hiit", "treadmill", "cycle", "swim"]):
        advice = "Incorporate 2-3 sessions of low-intensity steady-state (LISS) cardio (like incline walking) or 1-2 short HIIT sessions per week to build cardiovascular health without hindering muscle recovery."
        reason = "Cardiovascular fitness improves work capacity during lifting sessions and enhances systemic recovery."
        action_plan = [
            "Perform 20-30 minutes of incline treadmill walking (10-12% incline, 3 mph) post-workout.",
            "Keep cardio sessions separate from leg strength training days to prevent interference.",
            "Monitor heart rate to stay within Zone 2 (roughly 60-70% of max HR) for aerobic benefits."
        ]
    elif any(k in q for k in ["sleep", "rest", "recovery", "sore", "stretch", "mobility"]):
        advice = "Optimize your recovery by sleeping 7-9 hours per night, drinking plenty of water, and incorporating active recovery sessions like light stretching or mobility drills."
        reason = "Muscle growth occurs during rest and deep sleep, when human growth hormone levels peak and tissues repair."
        action_plan = [
            "Establish a consistent sleep schedule and keep your bedroom cool, dark, and screen-free.",
            "Use a foam roller or perform 10 minutes of active dynamic stretching post-workout.",
            "Incorporate a dedicated deload week every 6-8 weeks of intense lifting to give joints a break."
        ]
    elif any(k in q for k in ["plan", "routine", "schedule", "program", "split"]):
        advice = "For intermediate lifters, a Push/Pull/Legs (PPL) or Upper/Lower split is ideal for balancing high frequency, volume, and recovery."
        reason = "Training each muscle group 2x per week maximizes muscle protein synthesis cycles compared to once-a-week splits."
        action_plan = [
            "Option A: 4-day Upper/Lower split (Monday/Tuesday, Thursday/Friday).",
            "Option B: 5 or 6-day Push/Pull/Legs split.",
            "Ensure you schedule at least 1-2 complete rest days per week."
        ]

    return {
        "advice": advice,
        "reason": reason,
        "actionPlan": action_plan
    }

class AIService:
    def __init__(self):
        self._gen_ai_initialized = False

    def build_prompt(self, user_context: Dict[str, Any], query: str) -> str:
        return f"""
You are an elite certified fitness coach and nutrition expert.

User Profile:
- Age: {user_context.get('age')}
- Height: {user_context.get('height')}
- Weight: {user_context.get('weight')}
- Goal: {user_context.get('goal')}
- Fitness Level: {user_context.get('level')}

Workout History (Last 7 Days):
{user_context.get('last_7_days_summary')}

User Query:
"{query}"

Instructions:
- Give short, actionable advice
- Be motivating but realistic
- Avoid unsafe recommendations
- Suggest improvements based on history
- Output strictly in JSON format matching this schema without any markdown formatting wrappers:
{{
  "advice": "Main coaching statement",
  "reason": "Why you are suggesting this",
  "actionPlan": ["Step 1", "Step 2"]
}}
"""

    async def generate_response(self, query: str, user_id: str) -> Dict[str, Any]:
        user_context = get_mock_user_context()
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key == 'YOUR_GEMINI_API_KEY_HERE':
            print("⚠️ [ai_service] Google Gemini API key not configured. Using fallback AI response.")
            return get_fallback_ai_response(query, user_context)

        if not self._gen_ai_initialized:
            try:
                genai.configure(api_key=api_key)
                self._gen_ai_initialized = True
            except Exception as e:
                print(f"⚠️ [ai_service] Configuration error: {e}. Using fallback AI response.")
                return get_fallback_ai_response(query, user_context)

        retries = 2
        while retries >= 0:
            try:
                prompt = self.build_prompt(user_context, query)

                model = genai.GenerativeModel(
                    model_name="gemini-flash-latest",
                    generation_config={"response_mime_type": "application/json"}
                )

                response = await model.generate_content_async(prompt)
                text = response.text
                
                # Strip markdown backticks if Gemini incorrectly wraps response
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()

                return json.loads(text)
            except Exception as error:
                err_msg = str(error)
                is_rate_limit = "429" in err_msg or (hasattr(error, "status_code") and error.status_code == 429)
                if is_rate_limit and retries > 0:
                    retries -= 1
                    await asyncio.sleep(2.0)
                    continue

                print(f"⚠️ [ai_service] Gemini API exception: {err_msg}. Generating fallback coaching advice.")
                return get_fallback_ai_response(query, user_context)

ai_service = AIService()
