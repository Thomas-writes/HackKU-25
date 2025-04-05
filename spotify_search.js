//KMS KMS KMS KMS KMS KMS KMS 

//RAHHHHHH

const fetch = require("node-fetch"); //Lets you use node.js to get access token
const clientSecret = "28f21ed9b3344f9ea1a047756af9927c"
const clientID = "408141d3d0da4e43a7d4324f99e95d7c"
const token = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");

async function searchSongs(songDict, accessToken) { // Pass accessToken as a parameter
    for (const [title, artist] of Object.entries(songDict)) {
        const query = `track:${title} artist:${artist}`; // Define query here
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;
        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Use accessToken here
                }
            });
            const data = await response.json();
            //console.log("Search API Response:", JSON.stringify(data, null, 2));
            const track = data.tracks?.items?.[0];
            if (!track) {
                console.error(`No track found for "${title}" by "${artist}"`);
                continue;
            }
            console.log("Title:", track.name);
            console.log("Artist:", track.artists[0].name);
            console.log("Album:", track.album.name);
            console.log("Spotify URL:", track.external_urls.spotify);
            console.log("Image URL:", track.album.images[0]?.url || "No image available");
        } catch (error) {
            console.error("Error fetching song data:", error);
        }
    }
}

fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    headers:{
        'Authorization': `Basic ${token}`,
        'Content-Type': "application/x-www-form-urlencoded"
    },
    body: 'grant_type=client_credentials'
})
.then(res => res.json())
.then(data => {
    const accessToken = data.access_token;
    console.log("Access token:", accessToken);
    (async () => {
        try {
            const songDict = {
                "Save Me": "Chief Keef",
                "EARFQUAKE": "Tyler, The Creator"
            };
            await searchSongs(songDict, accessToken); // Call searchSongs with accessToken
        } catch (error) {
            console.error('Error:', error);
        }
    })();
})
.catch(error => console.error('Error', error));

