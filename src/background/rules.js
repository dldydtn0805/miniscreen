export const MOBILE_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

export const DEFAULT_VIEW_MODE = "mobile";
const BLOCKED_SCRIPT_URL_FILTERS = ["||excavatenearbywand.com^"];

export function buildDynamicRules(viewMode) {
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
    ...BLOCKED_SCRIPT_URL_FILTERS.map((urlFilter, index) => ({
      id: 3 + index,
      priority: 2,
      action: {
        type: "block",
      },
      condition: {
        urlFilter,
        resourceTypes: ["script"],
      },
    })),
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

export function applyViewMode(viewMode, callback = () => {}) {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [1, 2, ...BLOCKED_SCRIPT_URL_FILTERS.map((_, index) => 3 + index)],
      addRules: buildDynamicRules(viewMode),
    },
    callback
  );
}
