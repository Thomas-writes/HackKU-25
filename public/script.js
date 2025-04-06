let dict = {}
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyDnd-mN8-YCU0fQGQwEUAf8u5msU0vHxpA" });

//Gets song inside input box and sends to gemini
async function getSong(){
const loadingWindow = window.open('/loading.html', '_blank'); // 🚀 Opens instantly!

  // ⏳ Prepare everything else
  spotifyURIArray = JSON.parse(localStorage.getItem("spotifyURIArray") || "[]");
  titleArray = [];
  artistArray = [];
  albumArray = [];
  spotifyURLArray = [];
  imageArray = [];
  dict = {};

  let response;
  const song_name = document.getElementById("in").value;
  document.getElementById("in").value = "";

  const adv_search = document.getElementById("adv_search");
  if (adv_search.style.display === "none") {
    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `List 10 songs similar to ${song_name} with no description. Separate song and artist with " - ".`,
    });
  } else {
    const num_songs = document.getElementById("NUM").value;
    const BPM = document.getElementById("BPM").value;
    const duration = document.getElementById("DUR").value;
    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `List ${num_songs} songs like ${song_name} around ${duration} minutes and within ${BPM * 5} BPM. No descriptions. Use " - ".`,
    });
  }

  let list = response.text.trim().split("\n").filter(Boolean);
  sendToSpotify(list, loadingWindow);
}
//This function is used to toggle the visibility of the advanced search options.
function advSearch() 
{
  const ele = document.getElementById("adv_search");
  const sliders = ele.querySelectorAll(".slider"); // Select all slider elements inside adv_search

  if (ele.style.display == "none" || ele.style.display == "") {
    ele.style.display = "block";
    ele.style.height = "0px";
    ele.style.opacity = "0";
    sliders.forEach(slider => (slider.style.opacity = "0")); // Hide sliders initially

    //Set a timeout to make sure everything is applied correctly.
    setTimeout(() => {
                      //Set transition times and target values.
                      ele.style.transition = "height 0.5s ease, opacity 0.5s ease";
                      ele.style.height = "32vh";
                      ele.style.opacity = "1";
                      //Set another timeout so the sliders don't seem to appear faster than the container.
                      setTimeout(() => {
                      sliders.forEach(slider => {
                                              slider.style.transition = "opacity 1.25s ease";
                                              slider.style.opacity = "1";
                                              });
                    }, 200);
  }, 10);
  } 
  else 
  {
    ele.style.transition = "height 0.5s ease, opacity 0.5s ease"; 
    ele.style.height = "0px";
    ele.style.opacity = "0";
    sliders.forEach(slider => (slider.style.opacity = "0"));
    //Set display to none after the transition is done.
    setTimeout(() => {
      ele.style.display = "none";
    }, 900);
  }
}

function sendToSpotify(list, loadingWindow) {
  dict = {};

  for (let entry of list) {
    const splitIndex = entry.indexOf("-");
    if (splitIndex === -1) continue;
    const song = entry.slice(0, splitIndex).trim();
    const artist = entry.slice(splitIndex + 1).trim();
    dict[song] = artist;
  }

  main(loadingWindow);
}

document.advSearch = advSearch;
document.getSong = getSong;

// Exporting the arrays so they can be used in other files
export let titleArray = [];
export let artistArray = [];
export let albumArray = [];
export let spotifyURLArray = [];
export let imageArray = [];
export let spotifyURIArray = [];

export function main(loadingWindow) {
  const clientSecret = "4168aaad5d40473192bd5fb745ca3c9a";
  const clientID = "408141d3d0da4e43a7d4324f99e95d7c";
  const token = btoa(`${clientID}:${clientSecret}`);

  async function searchSongs(songDict, accessToken) {
    const songData = {
      titleArray: [],
      artistArray: [],
      albumArray: [],
      spotifyURLArray: [],
      imageArray: [],
      spotifyURIArray: [],
    };

    for (const [title, artist] of Object.entries(songDict)) {
      const query = `track:${title} artist:${artist}`;
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        const track = data.tracks?.items?.[0];
        if (!track) continue;

        songData.titleArray.push(track.name);
        songData.artistArray.push(track.artists[0].name);
        songData.albumArray.push(track.album.name);
        songData.spotifyURLArray.push(track.external_urls.spotify);
        songData.imageArray.push(track.album.images[0]?.url || "No image available");
        songData.spotifyURIArray.push(track.uri);
      } catch (error) {
        console.error("Error fetching song data:", error);
      }
    }

    setTimeout(() => {
      loadingWindow.location.href = '/output/output.html';

      const interval = setInterval(() => {
        try {
          if (
            loadingWindow &&
            loadingWindow.location.href.includes('output.html') &&
            loadingWindow.document.readyState === 'complete'
          ) {
            loadingWindow.postMessage(songData, '*');
            clearInterval(interval);
          }
        } catch (err) {}
      }, 100);
    }, 1000); // Wait 3 seconds AFTER data is ready
  }

  return fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: 'grant_type=client_credentials',
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error("Error getting access token:", data.error_description);
        return;
      }
      const accessToken = data.access_token;
      searchSongs(dict, accessToken);
    })
    .catch(error => {
      console.error('Error fetching access token:', error);
    });
}


document.toggleDropdown = toggleDropdown;