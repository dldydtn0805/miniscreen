import { applyViewMode, DEFAULT_VIEW_MODE } from "./rules.js";

const CONTENT_SCRIPT_FILES = [
  "src/content/constants.js",
  "src/content/utils.js",
  "src/content/dom.js",
  "src/content/storage.js",
  "src/content/bookmarks.js",
  "src/content/layout.js",
  "src/content/app.js",
];

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(["viewMode"], (result) => {
    const viewMode = result.viewMode || DEFAULT_VIEW_MODE;

    applyViewMode(viewMode, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: CONTENT_SCRIPT_FILES,
      });
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "MINISCREEN_SET_VIEW_MODE") {
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
