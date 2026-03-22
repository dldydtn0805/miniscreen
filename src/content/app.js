(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const FRAME_NAVIGATE_BACK_MESSAGE = "MINISCREEN_FRAME_NAVIGATE_BACK";
  const FRAME_APPLY_FONT_MESSAGE = "MINISCREEN_FRAME_APPLY_FONT";

  if (
    typeof state.destroyMiniScreen === "function" &&
    !document.getElementById("miniscreen")
  ) {
    state.destroyMiniScreen();
  }

  if (document.getElementById("miniscreen")) {
    return;
  }

  const { fallbackHomeUrl, defaultViewMode } = state.constants;
  const { normalizeTargetUrl, getBookmarkTitle } = state.utils;
  const elements = state.dom.createMiniScreen();
  const appState = {
    bookmarks: [],
    currentTitle: getBookmarkTitle(fallbackHomeUrl),
    currentUrl: fallbackHomeUrl,
    currentViewMode: defaultViewMode,
    isFullscreen: false,
    isComposing: false,
  };

  const layout = state.layout.createLayoutController({ elements, appState });
  const listenerController = new AbortController();
  const listenerOptions = { signal: listenerController.signal };
  let isDestroyed = false;
  let resizeFrameId = 0;

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

  const services = state.services.createMiniScreenService({
    appState,
    elements,
    applyViewMode,
    layout,
  });
  const bookmarkStore = state.bookmarks.createBookmarkStore({
    elements,
    appState,
    services,
  });
  document.body.appendChild(elements.miniScreen);

  const selectAllUrlInputText = () => {
    window.requestAnimationFrame(() => {
      elements.urlInput.select();
    });
  };

  const navigateToInputValue = () => {
    if (!elements.urlInput.value) {
      services.loadHome();
      return;
    }

    const targetUrl = normalizeTargetUrl(elements.urlInput.value);
    services.navigateTo(targetUrl);
  };

  const destroyMiniScreen = () => {
    if (isDestroyed) {
      return;
    }

    isDestroyed = true;

    if (resizeFrameId) {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = 0;
    }

    listenerController.abort();

    if (elements.iframe.src && elements.iframe.src !== "about:blank") {
      elements.iframe.src = "about:blank";
    }

    elements.miniScreen.remove();

    if (state.destroyMiniScreen === destroyMiniScreen) {
      delete state.destroyMiniScreen;
    }
  };

  state.destroyMiniScreen = destroyMiniScreen;

  const applyFrameFont = () => {
    elements.iframe.contentWindow?.postMessage(
      {
        type: FRAME_APPLY_FONT_MESSAGE,
      },
      "*"
    );
  };

  elements.backButton.addEventListener("click", () => {
    elements.iframe.contentWindow?.postMessage(
      { type: FRAME_NAVIGATE_BACK_MESSAGE },
      "*"
    );
  });

  elements.goButton.addEventListener("click", navigateToInputValue);

  elements.homeButton.addEventListener("click", () => {
    services.loadHome();
  });

  elements.homeButton.addEventListener("contextmenu", async (event) => {
    event.preventDefault();

    const targetUrl = elements.urlInput.value
      ? normalizeTargetUrl(elements.urlInput.value)
      : appState.currentUrl;

    await services.saveHome(targetUrl);
  });

  elements.bookmarkButton.addEventListener("click", () => {
    elements.bookmarkPanel.classList.toggle("hidden");
    elements.bookmarkButton.classList.toggle(
      "is-active",
      !elements.bookmarkPanel.classList.contains("hidden")
    );
  });

  elements.addBookmarkButton.addEventListener("click", async () => {
    await bookmarkStore.addCurrentBookmark();
  });

  document.addEventListener(
    "mousedown",
    (event) => {
      if (
        !elements.bookmarkPanel.classList.contains("hidden") &&
        !elements.bookmarkPanel.contains(event.target) &&
        !elements.bookmarkButton.contains(event.target)
      ) {
        elements.bookmarkPanel.classList.add("hidden");
        elements.bookmarkButton.classList.remove("is-active");
      }
    },
    listenerOptions
  );

  window.addEventListener(
    "resize",
    () => {
      if (resizeFrameId) {
        return;
      }

      resizeFrameId = window.requestAnimationFrame(() => {
        resizeFrameId = 0;

        if (appState.isFullscreen) {
          layout.syncFullscreenToViewport();
          return;
        }

        layout.resetMiniScreenPosition();
        layout.constrainMiniScreenToViewport();
      });
    },
    listenerOptions
  );

  elements.urlInput.addEventListener("compositionstart", () => {
    appState.isComposing = true;
  });

  elements.urlInput.addEventListener("compositionend", () => {
    appState.isComposing = false;
  });

  elements.urlInput.addEventListener("focus", () => {
    selectAllUrlInputText();
  });

  elements.urlInput.addEventListener("click", () => {
    selectAllUrlInputText();
  });

  elements.urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !appState.isComposing) {
      event.preventDefault();
      navigateToInputValue();
    }
  });

  elements.urlInput.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    layout.toggleFullscreen();
  });

  elements.closeButton.addEventListener("click", () => {
    destroyMiniScreen();
  });

  elements.viewModeButton.addEventListener("click", async () => {
    await services.toggleViewMode();
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

    elements.urlInput.value = appState.currentUrl;
    applyFrameFont();
  });

  window.addEventListener(
    "message",
    (event) => {
      if (
        event.source === elements.iframe.contentWindow &&
        event.data?.type === "MINISCREEN_FRAME_URL"
      ) {
        appState.currentUrl = event.data.href || appState.currentUrl;
        appState.currentTitle =
          event.data.title || getBookmarkTitle(appState.currentUrl);
        elements.urlInput.value = appState.currentUrl;
      }
    },
    listenerOptions
  );

  window.addEventListener("pagehide", destroyMiniScreen, listenerOptions);

  services.loadViewMode();

  bookmarkStore.loadBookmarks();
  services.loadHome();
})();
