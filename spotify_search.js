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
        const songDict = {
            "Save Me": "Chief Keef",
            "EARFQUAKE": "Tyler, The Creator"
        };
        return searchSongs(songDict, accessToken); // Continue the process after getting the token
    })
    .catch(error => {
        console.error('Error fetching access token:', error);
    });
};    