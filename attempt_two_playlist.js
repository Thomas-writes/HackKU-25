const clientId = "408141d3d0da4e43a7d4324f99e95d7c"; // ← Replace this
const redirectUri = window.location.origin;
const scopes = ["playlist-modify-public", "playlist-modify-private"];

const loginBtn = document.getElementById("login");
const createBtn = document.getElementById("create");
import { spotifyURIArray } from "./script.js";
// --- PKCE helpers ---
function generateRandomString(length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)]
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

// --- Login redirect ---
loginBtn.addEventListener("click", async () => {
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
});

// --- Token exchange after redirect ---
if (window.location.search.includes("code=")) {
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
  window.history.replaceState({}, document.title, "/"); // clean URL
  createBtn.style.display = "inline";
}

// --- Playlist creation ---
createBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return alert("Not logged in.");

  // Fetch user data
  const userRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    const errorData = await userRes.json();
    console.error("Error fetching user data:", errorData);
    alert("Failed to fetch user data. Check console for details.");
    return;
  }

  const user = await userRes.json();

  // Create playlist
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
    const errorData = await playlistRes.json();
    console.error("Error creating playlist:", errorData);
    alert("Failed to create playlist. Check console for details.");
    return;
  }

  const playlist = await playlistRes.json();

  const trackUris = spotifyURIArray;

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

  // Upload custom playlist cover
  try {
    const imageRes = await fetch("./cover.jpg"); // Fetch the image file from the project directory
    const imageBlob = await imageRes.blob();

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result.split(",")[1];
      console.log("Base64 Image:", base64Image);
    };
    reader.onerror = (error) => {
      console.error("Error reading image blob:", error);
    };
    reader.readAsDataURL(imageBlob);

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
      const errorData = await uploadRes.json();
      console.error("Error uploading playlist cover:", errorData);
      alert("Failed to upload playlist cover. Check console for details.");
      return;
    }

    alert(`Playlist created with custom cover: ${playlist.external_urls.spotify}`);
  } catch (error) {
    console.error("Error fetching or uploading the image:", error);
    alert("Failed to upload playlist cover. Check console for details.");
  }
});