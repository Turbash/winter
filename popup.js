document.getElementById("toggleSnow").onclick = async () => {
  chrome.storage.sync.get("snowEnabled", (data) => {
    chrome.storage.sync.set({ snowEnabled: !data.snowEnabled });
  });
};

document.getElementById("freeze").onclick = async () => {
  chrome.tabs.executeScript({
    code: `document.body.style.filter='brightness(50%) blur(3px)`,
  });
};

const quotes = [
  "Winter is coming",
  "In the coldest siege, fire is your friend",
  "Snow hides the weak, reveals the strong",
  "Survive the storm",
];

document.getElementById("quote").innerText =
  quotes[Math.floor(Math.random() * quotes.length)];
