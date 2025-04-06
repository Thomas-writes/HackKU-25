let dict = {};
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
  for(let iterate = 0; iterate < list.length; iterate++)
  {
    dict[list[iterate].slice(0, list[iterate].indexOf("-"))] = list[iterate].slice(list[iterate].indexOf("-")+2);
  }
  console.log(dict);
  main();
}

document.advSearch = advSearch;
document.getSong = getSong;

// Exporting the arrays so they can be used in other files
export let titleArray = [];
export let artistArray = [];
export let albumArray = [];
export let spotifyURLArray = [];
export let imageArray = [];

export function main() {
  const clientSecret = "4168aaad5d40473192bd5fb745ca3c9a"; // Insert your client secret here
  const clientID = "408141d3d0da4e43a7d4324f99e95d7c";
  const token = btoa(`${clientID}:${clientSecret}`);

  async function searchSongs(songDict, accessToken) {
      console.log(songDict);
      for (const [title, artist] of Object.entries(songDict)) {
          const query = `track:${title} artist:${artist}`;
          const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

          try {
              const response = await fetch(url, {
                  headers: {
                      'Authorization': `Bearer ${accessToken}`
                  }
              });

              const data = await response.json();
              const track = data.tracks?.items?.[0];
              if (!track) {
                  console.error(`No track found for "${title}" by "${artist}"`);
                  continue;
              }

              titleArray.push(track.name);
              artistArray.push(track.artists[0].name);
              albumArray.push(track.album.name);
              spotifyURLArray.push(track.external_urls.spotify);
              imageArray.push(track.album.images[0]?.url || "No image available");
          } catch (error) {
              console.error("Error fetching song data:", error);
          }
      }

      const songData = {
          titleArray,
          artistArray,
          albumArray,
          spotifyURLArray,
          imageArray
      };

      // Open the new window (it can be a new tab/window)
      const newWindow = window.open('output/output.html', '_blank'); // Open in a new tab/window

      // Wait for the new window to be ready to receive data
      const interval = setInterval(() => {
          if (newWindow && newWindow.document && newWindow.document.readyState === 'complete') {
              // Send the data to the new window
              newWindow.postMessage(songData, '*');
              clearInterval(interval); // Stop checking once the message is sent
              
              // Now close the original window (this window)
              window.close(); // This closes the original window
          }
      }, 100); // Check every 100ms
  }

  // Fetch access token and begin search
  return fetch('https://accounts.spotify.com/api/token', {
      method: "POST",
      headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
  })
  .then(res => res.json())
  .then(data => {
      if (data.error) {
          console.error("Error getting access token:", data.error_description);
          return;
      }
      const accessToken = data.access_token;
      const songDict = dict;
      return searchSongs(songDict, accessToken); // Continue the process after getting the token
  })
  .catch(error => {
      console.error('Error fetching access token:', error);
  });
};