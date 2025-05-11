//background.js

// 확장 프로그램의 활성화 상태를 저장
let isExtensionEnabled = true;

// 확장 프로그램 아이콘 상태 업데이트 함수
function updateIcon() {
  const iconPath = isExtensionEnabled ?
      { "16": "icon16.png", "48": "icon48.png", "128": "icon128.png" } :
      { "16": "icon16_disabled.png", "48": "icon48_disabled.png", "128": "icon128_disabled.png" };

  chrome.action.setIcon({ path: iconPath });

  // 툴팁 텍스트도 업데이트
  const title = isExtensionEnabled ? "MINISCREEN" : "MINISCREEN (비활성화됨)";
  chrome.action.setTitle({ title: title });
}

function ignoreXFameOptions() {
  if (!isExtensionEnabled) return;

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
  // 상태 토글
  isExtensionEnabled = !isExtensionEnabled;

  // 스토리지에 상태 저장
  chrome.storage.sync.set({ isEnabled: isExtensionEnabled }, () => {
    console.log("Extension enabled state updated:", isExtensionEnabled);
  });

  // 아이콘 업데이트
  updateIcon();

  if (isExtensionEnabled) {
    // 활성화된 경우 MINISCREEN 실행
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
    ignoreXFameOptions();
  } else {
    // 비활성화된 경우 기존 MINISCREEN 제거
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: removeMiniScreen,
    });

    // X-Frame-Options 무시 규칙 제거
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [],
    });
  }
});

// 확장 프로그램 시작 시 저장된 상태 복원
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['isEnabled'], (result) => {
    if (result.isEnabled !== undefined) {
      isExtensionEnabled = result.isEnabled;
      updateIcon();
    }
  });
});

// 확장 프로그램 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  isExtensionEnabled = true;
  chrome.storage.sync.set({ isEnabled: true });
  updateIcon();
});

// MINISCREEN 제거 함수(content script에서 실행)
function removeMiniScreen() {
  const miniscreen = document.getElementById('miniscreen');
  if (miniscreen) {
    miniscreen.remove();
  }
}