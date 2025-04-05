

import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyDnd-mN8-YCU0fQGQwEUAf8u5msU0vHxpA" });


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
      contents: "List 10 songs similar to " + song_name + " with no description. Please do not use any bold, italics, or mark ups and separate the song names from the artist by a -." +
        " Please do not say anything else but the song names and artist."
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
        " minutes long, with no description. Please do not use any bold, italics, or mark ups and separate the song names from the artist by a -." +
        " Please do not say anything else but the song names and artist."
      });
  }
  let list = response.text;
  console.log(response.text);
  list = list.split("\n").slice(0,-1);
  sendToSpotify(list);
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

function sendToSpotify(list)
{
  //Converts data obtained from gemini into a dictionary to send to the sptoify API
  console.log(list);
  let dict = {};
  for(let iterate = 0; iterate < list.length; iterate++)
  {
    dict[list[iterate].slice(0, list[iterate].indexOf("-"))] = list[iterate].slice(list[iterate].indexOf("-")+2);
  }
  console.log(dict);
  
}

document.advSearch = advSearch;
document.getSong = getSong;