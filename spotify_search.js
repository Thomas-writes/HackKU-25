//KMS KMS KMS KMS KMS KMS KMS 

//RAHHHHHH

const fetch = require("node-fetch"); //Lets you use node.js to get access token
const clientSecret = ""
const clientID = ""
const token = Buffer.from(`${clientID}:${clientSecret}`).toString("base64");
let songTitle = "Save Me" //put song title here
let artist = "Cheif Keef"
const query = `track:${songTitle} artist:${artist}`;

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
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
        
    })
        .then(response => response.json())
        .then(data => {
            console.log("Search API Response:", JSON.stringify(data, null, 2));
            const track = data.tracks?.items?.[0];
            if (!track) {
                console.error("No track found!");
                return;
            }
            console.log("Title", track.name);
            console.log("Artist", track.artists[0].name);
            console.log("Album:", track.album.name);
            console.log('Preview URL:', track.preview_url);
        })
        .catch(error => console.error('Error', error));
});

