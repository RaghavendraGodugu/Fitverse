import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock DB/Redis context retrieval
const getMockUserContext = () => ({
  age: 28,
  height: '180cm',
  weight: '80kg',
  goal: 'Muscle Gain',
  level: 'Intermediate',
  last_7_days_summary: '3 workouts completed. Chest volume was high. Missed leg day.'
});

class AIService {
  constructor() {
    // Initialization moved to generateResponse to prevent ES Module hoisting issues
  }

  buildPrompt(userContext, query) {
    return `
You are an elite certified fitness coach and nutrition expert.

User Profile:
- Age: ${userContext.age}
- Height: ${userContext.height}
- Weight: ${userContext.weight}
- Goal: ${userContext.goal}
- Fitness Level: ${userContext.level}

Workout History (Last 7 Days):
${userContext.last_7_days_summary}

User Query:
"${query}"

Instructions:
- Give short, actionable advice
- Be motivating but realistic
- Avoid unsafe recommendations
- Suggest improvements based on history
- Output strictly in JSON format matching this schema without any markdown formatting wrappers:
{
  "advice": "Main coaching statement",
  "reason": "Why you are suggesting this",
  "actionPlan": ["Step 1", "Step 2"]
}
    `;
  }

  async generateResponse(query, userId) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return {
        advice: "Google Gemini is not configured yet. Please add your GEMINI_API_KEY to the backend .env file.",
        reason: "Missing API Key",
        actionPlan: ["Go to backend/.env", "Set GEMINI_API_KEY=AIza..."]
      };
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let retries = 2;

    while (retries >= 0) {
      try {
        const userContext = getMockUserContext();
        const prompt = this.buildPrompt(userContext, query);

        // Standardizing to 2.5-flash as it is the current supported model
        const model = this.genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Strip markdown backticks if Gemini incorrectly wraps response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        return JSON.parse(text);
      } catch (error) {
        if ((error?.status === 429 || error?.message?.includes('429')) && retries > 0) {
          retries--;
          await sleep(2000); // 2 second backoff for burst limits
          continue;
        }

        console.error('Gemini API Service Error:', error.message);

        // Provide a smart local fallback instead of an error message if quota completely maxed OR if JSON parsing broke completely
        const lQuery = query.toLowerCase();
        const isDiet = lQuery.includes('diet') || lQuery.includes('food') || lQuery.includes('eat') || lQuery.includes('protein');
        const isWorkout = lQuery.includes('workout') || lQuery.includes('exercise') || lQuery.includes('lift') || lQuery.includes('muscle');
        
        const userContext = getMockUserContext();
        
        let advice = "Consistency is the ultimate driver of results. Stay disciplined to your routine and ensure 8 hours of sleep.";
        if (isDiet) {
          advice = `To hit your goal of ${userContext.goal}, focus on consuming roughly 2g of protein per kg of your ${userContext.weight} bodyweight daily.`;
        } else if (isWorkout) {
          advice = "Progressive overload is key. Review your recent history (3 workouts done) and try to increase your volume by 2-5% today.";
        }

        return {
          advice,
          reason: `Offline cache response automatically applied due to server limit or formatting anomaly.`,
          actionPlan: ["Drink plenty of water", "Focus on recovery", "Execute your scheduled training block"]
        };
      }
    }
  }
}

export default new AIService();
