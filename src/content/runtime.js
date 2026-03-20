(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const SET_VIEW_MODE_MESSAGE = "MINISCREEN_SET_VIEW_MODE";

  state.runtime = {
    setViewMode(viewMode) {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: SET_VIEW_MODE_MESSAGE,
            viewMode,
          },
          (response) => {
            if (chrome.runtime.lastError || !response?.ok) {
              resolve(null);
              return;
            }

            resolve(response.viewMode);
          }
        );
      });
    },
  };
})();
