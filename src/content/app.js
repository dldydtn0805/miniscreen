(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  if (document.getElementById("miniscreen")) {
    return;
  }

  const { fallbackHomeUrl, defaultViewMode } = state.constants;
  const { normalizeTargetUrl, getBookmarkTitle } = state.utils;
  const storage = state.storage;
  const runtime = state.runtime;
  const elements = state.dom.createMiniScreen();
  const appState = {
    bookmarks: [],
    currentTitle: getBookmarkTitle(fallbackHomeUrl),
    currentUrl: fallbackHomeUrl,
    currentViewMode: defaultViewMode,
    isComposing: false,
  };

  const bookmarkStore = state.bookmarks.createBookmarkStore({ elements, appState });
  const layout = state.layout.createLayoutController({ elements, appState });
  document.body.appendChild(elements.miniScreen);

  const applyViewMode = (viewMode) => {
    appState.currentViewMode = viewMode === "desktop" ? "desktop" : "mobile";
    elements.miniScreen.dataset.viewMode = appState.currentViewMode;
    elements.viewModeButton.textContent =
      appState.currentViewMode === "mobile" ? "M" : "W";
    elements.viewModeButton.setAttribute(
      "aria-label",
      appState.currentViewMode === "mobile"
        ? "Switch to desktop web view"
        : "Switch to mobile view"
    );
    elements.viewModeButton.title =
      appState.currentViewMode === "mobile" ? "Mobile view" : "Desktop web view";
  };

  const loadHome = async () => {
    const homeUrl = await storage.getHome();
    appState.currentUrl = homeUrl;
    appState.currentTitle = getBookmarkTitle(homeUrl);
    elements.iframe.src = homeUrl;
  };

  const navigateTo = (targetUrl) => {
    appState.currentUrl = targetUrl;
    appState.currentTitle = getBookmarkTitle(targetUrl);
    elements.iframe.src = targetUrl;
  };

  const navigateToInputValue = () => {
    if (!elements.urlInput.value) {
      loadHome();
      return;
    }

    const targetUrl = normalizeTargetUrl(elements.urlInput.value);
    elements.urlInput.value = "";
    navigateTo(targetUrl);
  };

  elements.backButton.addEventListener("click", () => {
    window.history.back();
  });

  elements.goButton.addEventListener("click", navigateToInputValue);

  elements.homeButton.addEventListener("click", () => {
    loadHome();
  });

  elements.homeButton.addEventListener("contextmenu", async (event) => {
    event.preventDefault();

    const targetUrl = elements.urlInput.value
      ? normalizeTargetUrl(elements.urlInput.value)
      : appState.currentUrl;

    await storage.setHome(targetUrl);
    elements.urlInput.value = "";
    navigateTo(targetUrl);
  });

  elements.bookmarkButton.addEventListener("click", () => {
    elements.bookmarkPanel.classList.toggle("hidden");
    elements.bookmarkButton.classList.toggle(
      "is-active",
      !elements.bookmarkPanel.classList.contains("hidden")
    );
  });

  elements.addBookmarkButton.addEventListener("click", () => {
    bookmarkStore.addCurrentBookmark();
  });

  document.addEventListener("mousedown", (event) => {
    if (
      !elements.bookmarkPanel.classList.contains("hidden") &&
      !elements.bookmarkPanel.contains(event.target) &&
      !elements.bookmarkButton.contains(event.target)
    ) {
      elements.bookmarkPanel.classList.add("hidden");
      elements.bookmarkButton.classList.remove("is-active");
    }
  });

  window.addEventListener("resize", () => {
    layout.resetMiniScreenPosition();
  });

  elements.urlInput.addEventListener("compositionstart", () => {
    appState.isComposing = true;
  });

  elements.urlInput.addEventListener("compositionend", () => {
    appState.isComposing = false;
  });

  elements.urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !appState.isComposing) {
      event.preventDefault();
      navigateToInputValue();
    }
  });

  elements.closeButton.addEventListener("click", () => {
    elements.miniScreen.remove();
  });

  elements.viewModeButton.addEventListener("click", async () => {
    const nextViewMode =
      appState.currentViewMode === "mobile" ? "desktop" : "mobile";

    const updatedViewMode = await runtime.setViewMode(nextViewMode);

    if (!updatedViewMode) {
      return;
    }

    applyViewMode(updatedViewMode);
    layout.constrainMiniScreenToViewport();
    elements.iframe.src =
      appState.currentUrl || elements.iframe.src || fallbackHomeUrl;
  });

  elements.iframe.addEventListener("load", () => {
    try {
      appState.currentUrl = elements.iframe.contentWindow.location.href;
      appState.currentTitle =
        elements.iframe.contentDocument?.title ||
        getBookmarkTitle(appState.currentUrl);
    } catch (error) {
      appState.currentUrl = elements.iframe.src || appState.currentUrl;
      appState.currentTitle = getBookmarkTitle(appState.currentUrl);
    }
  });

  window.addEventListener("message", (event) => {
    if (
      event.source === elements.iframe.contentWindow &&
      event.data?.type === "MINISCREEN_FRAME_URL"
    ) {
      appState.currentUrl = event.data.href || appState.currentUrl;
      appState.currentTitle =
        event.data.title || getBookmarkTitle(appState.currentUrl);
    }
  });

  storage.getViewMode().then((viewMode) => {
    applyViewMode(viewMode || defaultViewMode);
    layout.constrainMiniScreenToViewport();
  });

  bookmarkStore.loadBookmarks();
  loadHome();
})();
