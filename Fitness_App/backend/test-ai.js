import "dotenv/config";
import AIService from "./src/services/ai.service.js";

async function test() {
  try {
    const res = await AIService.generateResponse("I want to build bigger arms", "123");
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch(e) {
    console.error("Crash:", e);
  }
}
test();
