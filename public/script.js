let dict = {}
import { GoogleGenAI } from 'https://cdn.jsdelivr.net/npm/@google/genai@latest/+esm';

//create gemini AI
const ai = new GoogleGenAI({ apiKey: "AIzaSyDnd-mN8-YCU0fQGQwEUAf8u5msU0vHxpA" });

//Gets song inside input box and sends to gemini
async function getSong() 
{
  spotifyURIArray = JSON.parse(localStorage.getItem("spotifyURIArray") || "[]");
  //Declare variables for future use.
  titleArray = [];
  artistArray = [];
  albumArray = [];
  spotifyURLArray = [];
  imageArray = [];
  dict = {}
  let response;

  //obtain the song that the user enters and then clear the input box
  const song_name = document.getElementById("in").value;
  document.getElementById("in").value = "";

  //checks if the user used advanced search or not.
  const adv_search = document.getElementById("adv_search");
  if(adv_search.style.display == "none") 
  {
    //Doesn't use advanced search parameters if the display is none.
    response = await ai.models.generateContent(
    {
      model: "gemini-2.0-flash",
      contents: "List 10 songs similar to " + song_name + " with no description. Please do not use any bold, italics, or mark ups and separate the song names from the artist by a -." +
        " Please do not say anything else but the song names and artist. Please make sure that at least half the songs aren't mainstream"
    });
  }
  else
  {
    //Uses advanced search parameters if the display is not none.
    const num_songs = document.getElementById("NUM").value;
    const BPM = document.getElementById("BPM").value;
    const duration = document.getElementById("DUR").value;
    response = await ai.models.generateContent(
      {
        model: "gemini-2.0-flash",

        contents: "List " + num_songs +" song(s) similar to " + song_name + " that are within " + BPM*5 + " BPM and are around " + duration + 
        " minutes long, with no description. Please do not use any bold, italics, or mark ups and separate the song names from the artist by a -." +
        " Please do not say anything else but the song names and artist. Please make sure that at least half the songs aren't mainstream"
      });
  }
  //Create an array of the songs and artists obtained.
  let list = response.text;
  list = list.split("\n").slice(0,-1);
  sendToSpotify(list);
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

function sendToSpotify(list)
{
  //Converts data obtained from gemini into a dictionary to send to the sptoify API
  console.log(list);
  for(let iterate = 0; iterate < list.length; iterate++)
  {
    //Data in list is stored in the format of "Song - Artist", split based of the dash
    dict[list[iterate].slice(0, list[iterate].indexOf("-"))] = list[iterate].slice(list[iterate].indexOf("-")+2);
  }
  //Test variable to verify that the data is being divided correctly.
  console.log(dict);
  //Call the main function to send the data to the spotify API.
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
export let spotifyURIArray = [];

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
              spotifyURIArray.push(track.uri)
          } catch (error) {
              console.error("Error fetching song data:", error);
          }
      }

      const songData = {
          titleArray,
          artistArray,
          albumArray,
          spotifyURLArray,
          imageArray,
          spotifyURIArray
      };

      const newWindow = window.open('/loading.html', '_blank');

      setTimeout(() => {
        // Redirect to output.html after exactly 3 seconds
        newWindow.location.href = '/output/output.html';

        // Wait until output.html is fully loaded before sending the message
        const interval = setInterval(() => {
          try {
            if (
              newWindow &&
              newWindow.location.href.includes('output.html') &&
              newWindow.document.readyState === 'complete'
            ) {
              newWindow.postMessage(songData, '*');
              clearInterval(interval);
            }
          } catch (err) {
            // Ignore errors during navigation
          }
        }, 100);
      }, 3000);

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
}
document.toggleDropdown = toggleDropdown;