(async () => {
  const toggleBtn = document.getElementById("toggleSnow");
  const freezeBtn = document.getElementById("freeze");
  const quoteEl = document.getElementById("quote");
  const autoFreezeCheckbox = document.getElementById("autoFreeze");
  if (!toggleBtn || !freezeBtn || !quoteEl || !autoFreezeCheckbox) return;

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

  chrome.storage.sync.get({ autoFreezeEnabled: true }, (data) => {
    autoFreezeCheckbox.checked = data.autoFreezeEnabled;
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
        func: () =>
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

  autoFreezeCheckbox.onchange = () => {
    chrome.storage.sync.set({ autoFreezeEnabled: autoFreezeCheckbox.checked });
  };

  freezeBtn.onclick = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.id) return;

      if (tab.discarded) {
        await chrome.tabs.reload(tab.id);
        freezeBtn.innerText = "Freeze Screen";
      } else {
        const iconUrl = chrome.runtime.getURL("winter.png");

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (iconUrl) => {
            document.documentElement.setAttribute("data-winter-frozen", "true");

            if (!document.title.startsWith("❄️ ")) {
              document.title = "❄️ [Frozen] " + document.title;
            }

            const existingFavicons =
              document.querySelectorAll("link[rel*='icon']");
            existingFavicons.forEach((link) => link.remove());

            const newFavicon = document.createElement("link");
            newFavicon.rel = "icon";
            newFavicon.type = "image/png";
            newFavicon.href = iconUrl;
            document.head.appendChild(newFavicon);

            const overlay = document.createElement("div");
            overlay.id = "winter-freeze-overlay";
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, 
              rgba(173, 216, 230, 0.3) 0%,
              rgba(135, 206, 235, 0.4) 50%,
              rgba(176, 224, 230, 0.3) 100%);
            backdrop-filter: blur(12px) brightness(0.7);
            z-index: 2147483647;
            pointer-events: none;
            animation: winterFreezeIn 0.5s ease-out;
          `;
            overlay.innerHTML = `
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 120px;
              opacity: 0.4;
              text-shadow: 0 0 30px rgba(255,255,255,0.8);
              animation: winterPulse 2s ease-in-out infinite;
            ">❄️</div>
          `;

            const style = document.createElement("style");
            style.textContent = `
            @keyframes winterFreezeIn {
              from {
                opacity: 0;
                backdrop-filter: blur(0px) brightness(1);
              }
              to {
                opacity: 1;
                backdrop-filter: blur(12px) brightness(0.7);
              }
            }
            @keyframes winterPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.6; }
            }
          `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
            document.body.style.pointerEvents = "none";
          },
          args: [iconUrl],
        });

        setTimeout(async () => {
          await chrome.tabs.discard(tab.id);
          freezeBtn.innerText = "Unfreeze Screen";
        }, 600);
      }
    } catch (e) {
      console.error("Error toggling freeze:", e);
    }
  };

  chrome.tabs.onActivated.addListener(updateFreezeText);
  chrome.tabs.onUpdated.addListener(updateFreezeText);
})();
