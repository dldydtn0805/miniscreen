const MOBILE_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";
const DEFAULT_VIEW_MODE = "mobile";

function buildDynamicRules(viewMode) {
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        responseHeaders: [
          { header: "X-Frame-Options", operation: "remove" },
          { header: "Frame-Options", operation: "remove" },
          { header: "Content-Security-Policy", operation: "remove" },
          { header: "X-Content-Security-Policy", operation: "remove" },
        ],
      },
      condition: {
        urlFilter: "*",
        resourceTypes: ["sub_frame"],
      },
    },
  ];

  if (viewMode === "mobile") {
    rules.push({
      id: 2,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "User-Agent",
            operation: "set",
            value: MOBILE_USER_AGENT,
          },
        ],
      },
      condition: {
        resourceTypes: ["sub_frame"],
      },
    });
  }

  return rules;
}

function applyViewMode(viewMode, callback = () => {}) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [1, 2],
      addRules: buildDynamicRules(viewMode),
    },
    callback
  );
}

// 확장 프로그램 아이콘을 클릭하면 content.js가 실행된다
chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(["viewMode"], (result) => {
    const viewMode = result.viewMode || DEFAULT_VIEW_MODE;

    applyViewMode(viewMode, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
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
