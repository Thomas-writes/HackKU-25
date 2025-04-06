console.log("Script loaded.");

const clientId = "408141d3d0da4e43a7d4324f99e95d7c";
const redirectUri = "https://spotasonghackku25.web.app/output/output.html";
const scopes = ["playlist-modify-public", "playlist-modify-private"];

const spotifyURIArray = JSON.parse(localStorage.getItem("spotifyURIArray") || "[]");
console.log("Redirect URI being sent to Spotify:", redirectUri);
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
  const createBtn = document.getElementById("create");
  console.log("Create button:", createBtn);
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      console.log("Create button clicked");
      createPlaylist();
    });
  }

  if (window.location.search.includes("code=")) {
    console.log("Handling redirect from Spotify");
    handleRedirectAndCreate();
  }
});


// --- PKCE Helpers ---
function generateRandomString(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  ).join("");
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// --- Handle Redirect ---
async function handleRedirectAndCreate() {
  const code = new URLSearchParams(window.location.search).get("code");
  const verifier = localStorage.getItem("code_verifier");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  const tokenData = await tokenRes.json();
  localStorage.setItem("access_token", tokenData.access_token);
  window.history.replaceState({}, document.title, window.location.pathname);
  createPlaylist();
}

// --- Main Logic ---
async function createPlaylist() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("code_verifier", verifier);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      code_challenge_method: "S256",
      code_challenge: challenge,
      scope: scopes.join(" "),
    });

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    return;
  }

  const userRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    console.error("User fetch failed:", await userRes.json());
    return alert("Failed to get Spotify user.");
  }

  const user = await userRes.json();

  const playlistRes = await fetch(
    `https://api.spotify.com/v1/users/${user.id}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "spot-a-song mix",
        description: "Vibes that match",
        public: false,
      }),
    }
  );

  if (!playlistRes.ok) {
    console.error("Playlist creation failed:", await playlistRes.json());
    return alert("Failed to create playlist.");
  }

  const playlist = await playlistRes.json();
  const trackUris = JSON.parse(localStorage.getItem("spotifyURIArray") || "[]");

  if (!trackUris.length) {
    return alert("No tracks found. Generate a playlist first.");
  }

  const addTracksRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: trackUris }),
    }
  );

  if (!addTracksRes.ok) {
    console.error("Adding tracks failed:", await addTracksRes.json());
    return alert("Failed to add tracks.");
  }

  try {
    const imageRes = await fetch("./cover.jpg");
    const imageBlob = await imageRes.blob();

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result.split(",")[1];

      const uploadRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/images`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "image/jpeg",
          },
          body: base64Image,
        }
      );

      if (!uploadRes.ok) {
        console.error("Image upload failed:", await uploadRes.json());
        return alert("Cover upload failed.");
      }

      alert("Playlist created successfully! Opening in Spotify...");
      window.open(playlist.external_urls.spotify, "_blank");
    };

    reader.readAsDataURL(imageBlob);
  } catch (err) {
    console.error("Cover image error:", err);
    alert("Failed to upload cover.");
  }
}
