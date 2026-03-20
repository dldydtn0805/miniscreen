import { applyViewMode, DEFAULT_VIEW_MODE } from "./rules.js";
import { registerRuntimeMessageHandlers } from "./messages.js";

const CONTENT_SCRIPT_FILES = [
  "src/content/constants.js",
  "src/content/utils.js",
  "src/content/dom.js",
  "src/content/storage.js",
  "src/content/runtime.js",
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

registerRuntimeMessageHandlers({ applyViewMode });
