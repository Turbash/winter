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
        const videoUrl = chrome.runtime.getURL("freeze-animation.mp4");

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (iconUrl, videoUrl) => {
            document.documentElement.setAttribute("data-winter-frozen", "true");

            if (!document.title.startsWith("[Frozen]")) {
              document.title = "[Frozen] " + document.title;
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
              background: rgba(173, 216, 230, 0.2);
              z-index: 9999;
              pointer-events: none;
              animation: winterFreezeIn 0.5s ease-out;
              `;

            const video = document.createElement("video");
            video.src = videoUrl;
            video.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0.6;
                mix-blend-mode: screen;
              `;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            overlay.appendChild(video);

            const blurDiv = document.createElement("div");
            blurDiv.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                backdrop-filter: blur(8px) brightness(0.7);
                z-index: 1;
              `;
            overlay.appendChild(blurDiv);

            const snowflakeDiv = document.createElement("div");
            snowflakeDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 120px;
                opacity: 0.5;
                text-shadow: 0 0 10px white;
                z-index: 2;
                animation: winterPulse 2s ease-in-out infinite;
              `;
            snowflakeDiv.textContent = "snowflake";
            // overlay.appendChild(snowflakeDiv);

            const style = document.createElement("style");
            style.textContent = `
                @keyframes winterFreezeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes winterPulse {
                  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                }
              `;
            document.head.appendChild(style);
            document.body.appendChild(overlay);
            document.body.style.pointerEvents = "none";
          },
          args: [iconUrl, videoUrl],
        });

        setTimeout(async () => {
          // await chrome.tabs.discard(tab.id);
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
