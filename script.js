

import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyBp9yVHCUpmaJVQF6ksR6fgzqS0uogfn7U" });


//Gets song inside input box and sends to gemini
async function getSong() 
{
  let response;
  const song_name = document.getElementById("in").value;
  document.getElementById("in").value = "";
  const adv_search = document.getElementById("adv_search");
  if(adv_search.style.display == "none") 
  {
    response = await ai.models.generateContent(
    {
      model: "gemini-2.0-flash",
      contents: "List 10 songs similar to " + song_name + " with no description"
    });
  }
  else
  {
    console.log(document.getElementsByClassName("slider"));
    const num_songs = document.getElementById("NUM").value;
    console.log(num_songs);
    const BPM = document.getElementById("BPM").value;
    const duration = document.getElementById("DUR").value;
    response = await ai.models.generateContent(
      {
        model: "gemini-2.0-flash",
        contents: "List " + num_songs +" songs similar to " + song_name + " that are within " + BPM + " BPM and are around " + duration + 
        " minutes long, with no description."
      });
  }
  let list = response.text;
  console.log(list);
  /*
  response = await ai.models.generateContent(
    {
      model: "gemini-2.0-flash",
      contents: "Remove all songs in the list by the author of the first song please and replace them with other songs. Here is the list: " + list
    }
  )
  console.log(response.text);*/
  list = list.split("\n").slice(2, 2+(document.getElementById("NUM").value));
  console.log(list);
}

function advSearch()
{
  const ele = document.getElementById("adv_search")
  if(ele.style.display == "none"){
   ele.style.display = "block";
  }
  else{
    ele.style.display = "none";
  }
}

document.getSong = getSong;
document.advSearch = advSearch;