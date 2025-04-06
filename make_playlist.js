// Make empty playlist first

export function main2(){
    const clientSecret = '4168aaad5d40473192bd5fb745ca3c9a';
    const clientID = "408141d3d0da4e43a7d4324f99e95d7c";
    const token = btoa(`${clientID}:${clientSecret}`);
    
    async function createPlaylist(accessToken) { // Accept accessToken as a parameter
        const userUrl = 'https://api.spotify.com/v1/me';

        try {
            // Get user Spotify ID
            const userRes = await fetch(userUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log(userRes)
            const userData = await userRes.json();
            const userId = userData.id;
            console.log(userData);
            console.log(userId);
            // Create a new empty playlist
            const playlistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;

            const playlistRes = await fetch(playlistUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'HACK KU test', // Take user input here later
                    description: "Created with SpotASong!",
                    public: false
                })
            });
            const playlistData = await playlistRes.json();
            console.log(playlistData);

            console.log("Playlist Created");
            console.log("Playlist ID:", playlistData.id);
            console.log("Link for playlist", playlistData.external_urls.spotify);

        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    }
    
    createPlaylist(token);
}
main2();

//add songs use for loop to hop through array of spotify URI's?
