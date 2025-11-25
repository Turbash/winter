(async () => {
  const toggleBtn = document.getElementById("toggleSnow");
  const freezeBtn = document.getElementById("freeze");
  const quoteEl = document.getElementById("quote");
  if (!toggleBtn || !freezeBtn || !quoteEl) return;

  const quotes = [
    "Winter is coming",
    "In the coldest siege, fire is your friend",
    "Snow hides the weak, reveals the strong",
    "Survive the storm",
  ];
  quoteEl.innerText = quotes[Math.floor(Math.random() * quotes.length)];

  chrome.storage.sync.get({ snowEnabled: false }, (data) => {
    toggleBtn.innerText = data.snowEnabled ? "Disable Snow" : "Enable Snow";
  });

  async function getFreezeState() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.id) return false;
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () =>
          document.documentElement.getAttribute("data-winter-frozen") ===
          "true",
      });
      return !!(result && result[0] && result[0].result);
    } catch {
      return false;
    }
  }

  async function updateFreezeText() {
    const frozen = await getFreezeState();
    freezeBtn.innerText = frozen ? "Unfreeze Screen" : "Freeze Screen";
  }

  await updateFreezeText();

  toggleBtn.onclick = () => {
    chrome.storage.sync.get({ snowEnabled: false }, (data) => {
      const next = !data.snowEnabled;
      chrome.storage.sync.set({ snowEnabled: next }, () => {
        toggleBtn.innerText = next ? "Disable Snow" : "Enable Snow";
      });
    });
  };

  freezeBtn.onclick = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.id) return;
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const root = document.documentElement;
          const was = root.getAttribute("data-winter-frozen") === "true";
          if (was) {
            root.removeAttribute("data-winter-frozen");
            document.body.style.filter = "";
            return false;
          } else {
            root.setAttribute("data-winter-frozen", "true");
            document.body.style.filter = "brightness(50%) blur(3px)";
            return true;
          }
        },
      });
      const newState = !!(results && results[0] && results[0].result);
      freezeBtn.innerText = newState ? "Unfreeze Screen" : "Freeze Screen";
    } catch {}
    chrome.tabs.onActivated.addListener(updateFreezeText);
    chrome.tabs.onUpdated.addListener(updateFreezeText);
  };
})();
