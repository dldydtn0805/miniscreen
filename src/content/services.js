(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const { fallbackHomeUrl, maxBookmarks, defaultViewMode } = state.constants;
  const { getBookmarkTitle } = state.utils;
  const storage = state.storage;
  const runtime = state.runtime;

  function createMiniScreenService({ appState, elements, applyViewMode, layout }) {
    return {
      navigateTo(targetUrl) {
        appState.currentUrl = targetUrl;
        appState.currentTitle = getBookmarkTitle(targetUrl);
        elements.urlInput.value = targetUrl;
        elements.iframe.src = targetUrl;
      },

      async loadHome() {
        const homeUrl = await storage.getHome();
        this.navigateTo(homeUrl);
        return homeUrl;
      },

      async saveHome(targetUrl) {
        await storage.setHome(targetUrl);
        this.navigateTo(targetUrl);
        return targetUrl;
      },

      async loadViewMode() {
        const viewMode = await storage.getViewMode();
        applyViewMode(viewMode || defaultViewMode);
        layout.constrainMiniScreenToViewport();
        return appState.currentViewMode;
      },

      async toggleViewMode() {
        const nextViewMode =
          appState.currentViewMode === "mobile" ? "desktop" : "mobile";
        const updatedViewMode = await runtime.setViewMode(nextViewMode);

        if (!updatedViewMode) {
          return null;
        }

        applyViewMode(updatedViewMode);
        layout.constrainMiniScreenToViewport();
        elements.iframe.src =
          appState.currentUrl || elements.iframe.src || fallbackHomeUrl;

        return updatedViewMode;
      },

      async loadBookmarks() {
        appState.bookmarks = await storage.getBookmarks();
        return appState.bookmarks;
      },

      openBookmark(bookmark) {
        appState.currentUrl = bookmark.url;
        appState.currentTitle = bookmark.title;
        elements.urlInput.value = bookmark.url;
        elements.iframe.src = bookmark.url;
        elements.bookmarkPanel.classList.add("hidden");
        elements.bookmarkButton.classList.remove("is-active");
      },

      async renameBookmark(index, nextTitle) {
        const trimmedTitle = nextTitle.trim();

        if (!trimmedTitle) {
          return false;
        }

        appState.bookmarks = appState.bookmarks.map((entry, bookmarkIndex) =>
          bookmarkIndex === index ? { ...entry, title: trimmedTitle } : entry
        );
        await storage.saveBookmarks(appState.bookmarks);
        return true;
      },

      async removeBookmark(index) {
        appState.bookmarks = appState.bookmarks.filter(
          (_, bookmarkIndex) => bookmarkIndex !== index
        );
        await storage.saveBookmarks(appState.bookmarks);
        return appState.bookmarks;
      },

      async reorderBookmarks(fromIndex, toIndex) {
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= appState.bookmarks.length ||
          toIndex > appState.bookmarks.length
        ) {
          return false;
        }

        const nextBookmarks = [...appState.bookmarks];
        const [movedBookmark] = nextBookmarks.splice(fromIndex, 1);
        const normalizedTargetIndex =
          fromIndex < toIndex ? toIndex - 1 : toIndex;

        if (!movedBookmark || normalizedTargetIndex === fromIndex) {
          return false;
        }

        nextBookmarks.splice(normalizedTargetIndex, 0, movedBookmark);
        appState.bookmarks = nextBookmarks;
        await storage.saveBookmarks(appState.bookmarks);
        return true;
      },

      async addCurrentBookmark() {
        const targetUrl = appState.currentUrl || elements.iframe.src;

        if (!targetUrl) {
          return { added: false, reason: "missing-url" };
        }

        if (appState.bookmarks.some((bookmark) => bookmark.url === targetUrl)) {
          elements.bookmarkPanel.classList.add("hidden");
          elements.bookmarkButton.classList.remove("is-active");
          return { added: false, reason: "duplicate" };
        }

        appState.bookmarks = [
          {
            title: appState.currentTitle || getBookmarkTitle(targetUrl),
            url: targetUrl,
          },
          ...appState.bookmarks,
        ].slice(0, maxBookmarks);

        await storage.saveBookmarks(appState.bookmarks);
        return { added: true, bookmarks: appState.bookmarks };
      },
    };
  }

  state.services = { createMiniScreenService };
})();
