function updateClock() {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

const hour = new Date().getHours();
const greet =
  hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

document.getElementById("greet").innerHTML = greet + ", Warrior";

document.getElementById("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    window.location.href = "https://www.google.com/search?q=" + e.target.value;
  }
});

const snowContainer = document.createElement("div");
const spotifyInput = document.getElementById("spotify-input");
spotifyInput.addEventListener("keypress", handleSpotifyInputUpdate);
snowContainer.className = "winter-snow-container";
document.body.appendChild(snowContainer);

for (let i = 0; i < 100; i++) {
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = Math.random() * 100 + "vw";
  snowflake.style.animationDelay = Math.random() * 5 + "s";
  snowflake.style.opacity = Math.random();
  snowContainer.appendChild(snowflake);
}

function handleSpotifyInputUpdate(event) {
  if (event.key === "Enter") {
    const input = document.getElementById("spotify-input").value;
    updateSpotifyPlayer(input);
    document.getElementById("spotify-input").value = "";
  }
}

function updateSpotifyPlayer(url) {
  const frame = document.getElementById("spotify-frame");
  let src = "";
  const regex = /spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  if (match) {
    const type = match[1];
    const id = match[2];
    embedSrc = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    frame.src = embedSrc;
  } else {
    alert(
      "Invalid Spotify URL. Please copy a link from Spotify (Share -> Copy Link)."
    );
  }
}
