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

        // Standardizing to flash-latest as it is the most reliable cluster path
        const model = this.genAI.getGenerativeModel({
          model: "gemini-flash-latest",
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

        // Relay the exact API error instead of a generic mock response
        return {
          advice: "Uh oh! Google Gemini API has blocked your request. Please check your API key quota.",
          reason: `API Blocked: ${error.message}`,
          actionPlan: ["Go to Google AI Studio and check your Billing / Quota Dashboard", "If you see 'limit: 0', your account doesn't have Free Tier access.", "Try adding a billing method to your Google account."]
        };
      }
    }
  }
}

export default new AIService();
