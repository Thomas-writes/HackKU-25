console.log("Script loaded.");

const clientId = "408141d3d0da4e43a7d4324f99e95d7c";
const redirectUri = "https://hack-ku-25.vercel.app/output/output.html";
const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private"
];

const spotifyURIArray = JSON.parse(localStorage.getItem("spotifyURIArray") || "[]");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
  const createBtn = document.getElementById("create");
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      console.log("Create button clicked");
      createPlaylist();
    });
  }

  if (window.location.search.includes("code=") && !sessionStorage.getItem("playlist_created")) {
    sessionStorage.setItem("playlist_created", "true");

    console.log("Handling redirect from Spotify");
    handleRedirectAndCreate();
  }
});

// --- PKCE Helpers ---
function generateRandomString(length) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

async function handleRedirectAndCreate() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
  const code = new URLSearchParams(window.location.search).get("code");
  const verifier = localStorage.getItem("code_verifier");

console.log("Code from URL:", code);
console.log("Verifier from storage:", verifier);
console.log("Code used already?", sessionStorage.getItem("code_used"));
// Prevent double-use of the code
if (!code || !verifier || sessionStorage.getItem("code_used")) {
  console.warn("Skipping token exchange: code already used or missing");
  return;
}
sessionStorage.setItem("code_used", "true");

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
  if (!tokenRes.ok || tokenData.error) {
    console.error("Token fetch failed:", tokenData);
    alert("Spotify authentication failed. Try again.");
    return;
  }

  localStorage.setItem("access_token", tokenData.access_token);
  localStorage.setItem("expires_at", Date.now() + tokenData.expires_in * 1000);

  createPlaylist();
}

async function getValidAccessToken() {
  const token = localStorage.getItem("access_token");
  const expiresAt = parseInt(localStorage.getItem("expires_at") || "0", 10);

  if (token && Date.now() < expiresAt) {
    return token;
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("expires_at");
  localStorage.removeItem("code_verifier");
  sessionStorage.clear();

  // Token expired or missing — restart auth
  const verifier = generateRandomString(128);
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem("code_verifier", verifier); // ✅ crucial line

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: scopes.join(" "),
    prompt: "consent",
    show_dialog: "true"
  });

  localStorage.setItem("code_verifier", verifier);

  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  return null;
}

// --- Main Logic ---
async function createPlaylist() {
  const token = await getValidAccessToken();
  if (!token) return; // user will be redirected

  const userRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    const err = await userRes.text();
    console.error("User fetch failed:", err);
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
    const err = await playlistRes.text();
    console.error("Playlist creation failed:", err);
    return alert("Failed to create playlist.");
  }

  const playlist = await playlistRes.json();
  const trackUris = spotifyURIArray.filter(
    (uri) => typeof uri === "string" && uri.startsWith("spotify:track:")
  );

  if (!trackUris.length) {
    return alert("No valid tracks found. Generate a playlist first.");
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
    const err = await addTracksRes.text();
    console.error("Adding tracks failed:", err);
    return alert("Failed to add tracks.");
  }

  try {
    const imageRes = await fetch("./cover.jpg");
    if (!imageRes.ok) throw new Error("Cover not found");
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
        const err = await uploadRes.text();
        console.error("Image upload failed:", err);
        return alert("Cover upload failed.");
      }

      window.open(playlist.external_urls.spotify, "_blank");
    };

    reader.readAsDataURL(imageBlob);
  } catch (err) {
    console.warn("Cover image skipped:", err);
    window.open(playlist.external_urls.spotify, "_blank");
  }
}
