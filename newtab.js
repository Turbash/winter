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
