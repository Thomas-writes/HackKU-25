// Exporting the arrays so they can be used in other files
export let titleArray = [];
export let artistArray = [];
export let albumArray = [];
export let spotifyURLArray = [];
export let imageArray = [];

export function main() {
    const clientSecret = ""; // Insert your client secret here
    const clientID = "408141d3d0da4e43a7d4324f99e95d7c";
    const token = btoa(`${clientID}:${clientSecret}`); // ✅ Replaced Buffer with btoa()

    async function searchSongs(songDict, accessToken) {
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
    }

    // Fetch access token and begin search
    fetch('https://accounts.spotify.com/api/token', {
        method: "POST",
        headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': "application/x-www-form-urlencoded"
        },
        body: 'grant_type=client_credentials'
    })
    .then(res => res.json())
    .then(data => {
        const accessToken = data.access_token;
        console.log("Access token:", accessToken);

        const songDict = {
            "Save Me": "Chief Keef",
            "EARFQUAKE": "Tyler, The Creator"
        };

        return searchSongs(songDict, accessToken);
    })
    .then(() => {
        // Log arrays after async work is complete
        console.log(titleArray);
        console.log(artistArray);
        console.log(albumArray);
        console.log(spotifyURLArray);
        console.log(imageArray);
    })
    .catch(error => console.error('Error:', error));
}
