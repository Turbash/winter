let snowContainer = null;

function addSnow() {
  if (snowContainer) return;
  snowContainer = document.createElement("div");
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
}

function removeSnow() {
  if (!snowContainer) return;
  document.body.removeChild(snowContainer);
  snowContainer = null;
}

chrome.storage.sync.get({ snowEnabled: false }, (data) => {
  if (data.snowEnabled) {
    addSnow();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync" || !changes.snowEnabled) return;
  if (changes.snowEnabled.newValue) {
    addSnow();
  } else {
    removeSnow();
  }
});
