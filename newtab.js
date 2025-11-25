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
