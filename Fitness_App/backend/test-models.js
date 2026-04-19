import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI('AIzaSyC-M6nc1W0TeBGbk1eyVo5B9XBtWE_1JnY');
async function list() {
  // Wait, GenAI version 0.24 doesn't have listModels directly exposed in this package sometimes, or maybe we can just make a direct GET request to the API
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC-M6nc1W0TeBGbk1eyVo5B9XBtWE_1JnY');
  const data = await response.json();
  console.log(data.models.map(m => m.name).join('\n'));
}
list();
