const FREEZE_TIMEOUT = 10 * 60 * 1000;
const CHECK_INTERVAL = 10 * 1000;
const tabLastActive = new Map();
let checkInterval = null;

async function getAutoFreezeEnabled() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ autoFreezeEnabled: true }, (data) => {
      resolve(data.autoFreezeEnabled);
    });
  });
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  tabLastActive.set(activeInfo.tabId, Date.now());
  console.log(
    `Tab ${activeInfo.tabId} activated at ${new Date().toLocaleTimeString()}`
  );
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    tabLastActive.set(tabId, Date.now());
    console.log(`Tab ${tabId} updated at ${new Date().toLocaleTimeString()}`);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabLastActive.delete(tabId);
  console.log(`Tab ${tabId} removed`);
});

async function initializeTabs() {
  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  tabs.forEach((tab) => {
    if (!tabLastActive.has(tab.id)) {
      tabLastActive.set(tab.id, tab.active ? now : now - FREEZE_TIMEOUT);
    }
  });
  console.log(`Initialized ${tabs.length} tabs`);
}

async function checkAndFreezeInactiveTabs() {
  const autoFreezeEnabled = await getAutoFreezeEnabled();
  console.log(`Auto-freeze check running. Enabled: ${autoFreezeEnabled}`);

  if (!autoFreezeEnabled) return;

  const now = Date.now();
  const tabs = await chrome.tabs.query({});
  const activeTabs = await chrome.tabs.query({ active: true });
  const activeTabIds = new Set(activeTabs.map((t) => t.id));

  console.log(`Checking ${tabs.length} tabs for inactivity...`);

  for (const tab of tabs) {
    if (
      activeTabIds.has(tab.id) ||
      tab.discarded ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://")
    ) {
      continue;
    }

    const lastActive = tabLastActive.get(tab.id) || now;
    const inactiveTime = now - lastActive;
    const inactiveMinutes = Math.floor(inactiveTime / 60000);

    console.log(
      `Tab ${tab.id} (${tab.title?.substring(
        0,
        30
      )}...): inactive for ${inactiveMinutes} min`
    );

    if (inactiveTime >= FREEZE_TIMEOUT) {
      try {
        console.log(`Attempting to freeze tab ${tab.id}...`);

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
              z-index: 2147483647;
              pointer-events: none;
            `;

            const video = document.createElement("video");
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
            video.src = videoUrl;
            video.autoplay = true;
            video.loop = true;
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

            document.body.appendChild(overlay);
            document.body.style.pointerEvents = "none";
          },
          args: [iconUrl, videoUrl],
        });

        await chrome.tabs.discard(tab.id);
        const updatedTab = await chrome.tabs.get(tab.id);
        console.log(
          `✓ Successfully froze tab ${tab.id}, discarded: ${updatedTab.discarded}`
        );
      } catch (e) {
        console.error(`✗ Failed to freeze tab ${tab.id}:`, e.message);
      }
    }
  }
}

async function startMonitoring() {
  console.log("Starting tab monitoring...");
  await initializeTabs();
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(checkAndFreezeInactiveTabs, CHECK_INTERVAL);
  checkAndFreezeInactiveTabs();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.autoFreezeEnabled) {
    console.log(
      `Auto-freeze ${
        changes.autoFreezeEnabled.newValue ? "enabled" : "disabled"
      }`
    );
    if (changes.autoFreezeEnabled.newValue) {
      startMonitoring();
    } else {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
  }
});

startMonitoring();
