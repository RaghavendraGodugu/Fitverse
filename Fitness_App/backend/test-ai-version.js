import "dotenv/config";
import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
     const model = genAI.getGenerativeModel({
          model: "gemini-flash-latest",
          // generationConfig: { responseMimeType: "application/json" }
     });
     const result = await model.generateContent("hello");
     console.log("Success gemini-flash-latest:", result.response.text());
  } catch(e) {
     console.error("Crash gemini-flash-latest:", e.message);
  }
}
test();
