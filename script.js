<<<<<<< HEAD

import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "API_KEY" });
=======
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyBAJI1McWcZ7i-ZSKk4BLhI0vFD1Yqy5O8" });
>>>>>>> 92c2be367119cf1da563bb6b717e4c84d7bb68a4

//Gets song inside input box and sends to gemini
async function getSong() 
{
  const song_name = document.getElementById("in").value;
<<<<<<< HEAD
=======
  document.getElementById("in").value = "";
>>>>>>> 92c2be367119cf1da563bb6b717e4c84d7bb68a4
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