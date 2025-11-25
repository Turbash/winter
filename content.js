const snowContainer = document.createElement("div");
snowContainer.className = "winter-snow-container";
document.body.appendChild(snowContainer);

for (let i = 0; i < 100; i++) {
  let snow = document.createElement("div");
  snow.className = "snowflake";
  snow.style.left = Math.random() * 100 + "vw";
  snow.style.animationDelay = Math.random() * 5 + "s";
  snow.style.opacity = Math.random();
  snowContainer.appendChild(snow);
}
