function ignoreXFameOptions() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          responseHeaders: [{ header: "X-Frame-Options", operation: "remove" }],
          requestHeaders: [
            {
              header: "User-Agent",
              operation: "set",
              value:
                "Mozilla/5.0 (Linux; Android 10; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
            },
          ],
        },
        condition: {
          urlFilter: "*",
          resourceTypes: ["sub_frame"],
        },
      },
    ],
  });
}

// 확장 프로그램 아이콘을 클릭하면 content.js가 실행된다
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
  ignoreXFameOptions();
});
