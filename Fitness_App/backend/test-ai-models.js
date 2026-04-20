import "dotenv/config";

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
     const res = await fetch(url);
     const json = await res.json();
     if(json.models) {
        console.log("Models:", json.models.map(m => m.name));
     } else {
        console.log("Response:", json);
     }
  } catch(e) {
     console.error("Crash:", e.message);
  }
}
test();
