(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const { fallbackHomeUrl, defaultViewMode } = state.constants;

  function getSyncValue(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, resolve);
    });
  }

  function setSyncValue(value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(value, resolve);
    });
  }

  state.storage = {
    async getHome() {
      const result = await getSyncValue(["home"]);
      return result.home || fallbackHomeUrl;
    },

    async setHome(home) {
      await setSyncValue({ home });
      return home;
    },

    async getViewMode() {
      const result = await getSyncValue(["viewMode"]);
      return result.viewMode || defaultViewMode;
    },

    async getBookmarks() {
      const result = await getSyncValue(["bookmarks"]);
      return Array.isArray(result.bookmarks) ? result.bookmarks : [];
    },

    async saveBookmarks(bookmarks) {
      await setSyncValue({ bookmarks });
      return bookmarks;
    },
  };
})();
