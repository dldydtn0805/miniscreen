const SET_VIEW_MODE_MESSAGE = "MINISCREEN_SET_VIEW_MODE";

export function registerRuntimeMessageHandlers({ applyViewMode }) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== SET_VIEW_MODE_MESSAGE) {
      return;
    }

    const viewMode = message.viewMode === "desktop" ? "desktop" : "mobile";

    chrome.storage.sync.set({ viewMode }, () => {
      applyViewMode(viewMode, () => {
        sendResponse({ ok: !chrome.runtime.lastError, viewMode });
      });
    });

    return true;
  });
}
