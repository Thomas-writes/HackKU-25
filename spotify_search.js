//KMS KMS KMS KMS KMS KMS KMS 

//RAHHHHHH

const fetch = require("node-fetch"); //Lets you use node.js to get access token
const clientSecret = "PUT CLIENT SECRET HERE"
const token = Buffer.from(`${clientID}:${clientSecret}`).toString("base64")

fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    headers:{
        'Authorization': `Basic ${token}`,
        'Content-Type': "application/x-www-form-urlencodded"
    },
    body: 'grant_type=client_credentials'
})
.then(res => res.json())
.then(data => {
    console.log('Access token:', data.access_token);
});

const accessToken = "YOUR ACCESS_TOKEN"
let songTitle = "SaveMe" //put song title here
fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle)}&type=track&limit=1`, {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
    
})
    .then(response => response.json())
    .then(data => {
        const track = data.tracks.items[0];
        console.log("Title", track.name);
        console.log("Artist", track.artists[0].name);
        console.log("Album:", track.album.name);
        console.log('Preview URL:', track.preview_url);
    })
    .catch(error => console.error('Error', error));