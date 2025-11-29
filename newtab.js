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
const newsContainer = document.getElementById("news-container");
const refreshBtn = document.querySelector(".refresh-btn");
fetchNews();
refreshBtn.addEventListener("click", fetchNews);
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

async function fetchNews() {
  newsContainer.innerHTML =
    '<li class="news-item" style="text-align:center;">Fetching Top Stories...</li>';
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    const ids = await response.json();
    const top15Ids = ids.slice(0, 15);
    const storyPromises = top15Ids.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
        (res) => res.json()
      )
    );
    const stories = await Promise.all(storyPromises);
    renderStories(stories);
  } catch (error) {
    console.error(error);
    newsContainer.innerHTML =
      '<li class="news-item" style="color:red;">Failed to load news.</li>';
  }
}

function renderStories(stories) {
  newsContainer.innerHTML = "";
  stories.forEach((story) => {
    if (!story) return;
    const li = document.createElement("li");
    li.className = "news-item";
    const timeAgo = new Date(story.time * 1000).toLocaleDateString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const domain = story.url
      ? new URL(story.url).hostname.replace("www", "")
      : "news.ycombinator.com";
    li.innerHTML = `
                <a href="${story.url}" target="_blank" class="news-title">${story.title}</a>
                <div class="news-meta">
                    ${story.score} points • ${domain} • ${timeAgo}
                </div>
            `;
    newsContainer.appendChild(li);
  });
}
