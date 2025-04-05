
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "API_KEY" });

//Gets song inside input box and sends to gemini
async function getSong() 
{
  const song_name = document.getElementById("in").value;
  document.getElementById("in").value = "";
  const response = await ai.models.generateContent(
  {
    model: "gemini-2.0-flash",
    contents: "List 10 songs similar to " + song_name + " with no description"
  });
  let list = response.text;
  list = list.split("\n").slice(2, 12);
  console.log(list);
}

document.getSong = getSong;
