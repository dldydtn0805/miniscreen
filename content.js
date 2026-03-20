function init() {
  // MINISCREEN이 이미 존재하면 초기화 하지 않음
  if (document.getElementById("miniscreen")) {
    return;
  }

  // MINISCREEN을 위한 DIV를 생성
  const miniScreen = document.createElement("div");
  miniScreen.id = "miniscreen";
  // 미니 스크린의 HTML 내용 설정
  miniScreen.innerHTML = `
    <div class="mini-screen-header">
      <button id="close-button" class="button-with-icon">X</button>
      <button id="back-button" class="button-with-icon"><</button>
      <button id="home-button" class="button-with-icon">⌂</button>
      <input type="text" id="url-input" placeholder="SEARCH WORD OR URL">
      <button id="go-button" class="button-with-icon">></button>
      <button id="bookmark-button" class="button-with-icon">★</button>
      <button id="view-mode-button" class="button-with-icon" type="button">M</button>
    </div>
      <div id="bookmark-panel" class="bookmark-panel hidden">
        <div class="bookmark-panel-header">
          <div class="bookmark-panel-heading">
            <span class="bookmark-panel-eyebrow">Library</span>
            <strong>Bookmarks</strong>
            <p class="bookmark-panel-copy">Keep your favorite pages close and open them in one tap.</p>
          </div>
          <button id="add-bookmark-button" type="button" aria-label="Add current page">+</button>
        </div>
      <div id="bookmark-empty" class="bookmark-empty">No bookmarks yet.</div>
      <div id="bookmark-list" class="bookmark-list"></div>
    </div>
    <iframe id="mini-iframe" referrerpolicy="unsafe-url"></iframe>
    <div id="resize-handle" aria-hidden="true"></div>
  `;

  // DOM 요소들 가져오기
  const urlInput = miniScreen.querySelector("#url-input");
  const backButton = miniScreen.querySelector("#back-button");
  const goButton = miniScreen.querySelector("#go-button");
  const closeButton = miniScreen.querySelector("#close-button");
  const viewModeButton = miniScreen.querySelector("#view-mode-button");
  const bookmarkButton = miniScreen.querySelector("#bookmark-button");
  const bookmarkPanel = miniScreen.querySelector("#bookmark-panel");
  const bookmarkList = miniScreen.querySelector("#bookmark-list");
  const bookmarkEmpty = miniScreen.querySelector("#bookmark-empty");
  const addBookmarkButton = miniScreen.querySelector("#add-bookmark-button");
  const iframe = miniScreen.querySelector("#mini-iframe");
  const header = miniScreen.querySelector(".mini-screen-header");
  const homeButton = miniScreen.querySelector("#home-button");
  const resizeHandle = miniScreen.querySelector("#resize-handle");
  const fallbackHomeUrl = "https://www.google.com/";
  const DEFAULT_VIEW_MODE = "mobile";
  let currentUrl = fallbackHomeUrl;
  let currentTitle = getBookmarkTitle(fallbackHomeUrl);
  let bookmarks = [];
  let editingBookmarkIndex = null;
  let currentViewMode = DEFAULT_VIEW_MODE;

  function applyViewMode(viewMode) {
    currentViewMode = viewMode === "desktop" ? "desktop" : "mobile";
    miniScreen.dataset.viewMode = currentViewMode;
    viewModeButton.textContent = currentViewMode === "mobile" ? "M" : "W";
    viewModeButton.setAttribute(
      "aria-label",
      currentViewMode === "mobile"
        ? "Switch to desktop web view"
        : "Switch to mobile view"
    );
    viewModeButton.title =
      currentViewMode === "mobile" ? "Mobile view" : "Desktop web view";
  }

  function getSizeConstraints() {
    const margin = 12;
    const { minWidth, minHeight } =
      currentViewMode === "desktop"
        ? { minWidth: 280, minHeight: 200 }
        : { minWidth: 280, minHeight: 320 };

    return {
      margin,
      minWidth,
      minHeight,
      maxWidth: Math.max(minWidth, window.innerWidth - margin * 2),
      maxHeight: Math.max(minHeight, window.innerHeight - margin * 2),
    };
  }

  function resetMiniScreenPosition() {
    miniScreen.style.left = "";
    miniScreen.style.top = "50%";
    miniScreen.style.bottom = "auto";
    miniScreen.style.transform = "translateY(-50%)";
  }

  function constrainMiniScreenToViewport() {
    const { margin, minWidth, minHeight, maxWidth, maxHeight } =
      getSizeConstraints();
    const currentRect = miniScreen.getBoundingClientRect();
    const nextWidth = Math.min(
      Math.max(currentRect.width, minWidth),
      maxWidth
    );
    const nextHeight = Math.min(
      Math.max(currentRect.height, minHeight),
      maxHeight
    );

    let nextLeft = currentRect.left;
    let nextTop = currentRect.top;

    if (currentRect.width !== nextWidth) {
      miniScreen.style.width = `${nextWidth}px`;
      nextLeft = Math.min(nextLeft, window.innerWidth - nextWidth - margin);
    }

    if (currentRect.height !== nextHeight) {
      miniScreen.style.height = `${nextHeight}px`;
      nextTop = Math.min(nextTop, window.innerHeight - nextHeight - margin);
    }

    nextLeft = Math.min(
      Math.max(margin, nextLeft),
      Math.max(margin, window.innerWidth - nextWidth - margin)
    );
    nextTop = Math.min(
      Math.max(margin, nextTop),
      Math.max(margin, window.innerHeight - nextHeight - margin)
    );

    miniScreen.style.left = `${nextLeft}px`;
    miniScreen.style.top = `${nextTop}px`;
    miniScreen.style.bottom = "auto";
    miniScreen.style.transform = "none";
  }

  function normalizeTargetUrl(rawValue) {
    if (!rawValue) {
      return fallbackHomeUrl;
    }

    if (!rawValue.includes(".")) {
      return `https://duckduckgo.com/?ia=web&origin=funnel_home_website&t=h_&q=${encodeURIComponent(rawValue)}`;
    }

    return rawValue.startsWith("http://") || rawValue.startsWith("https://")
      ? rawValue
      : `https://${rawValue}`;
  }

  function getBookmarkTitle(url) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.replace(/^www\./, "");
    } catch (error) {
      return url;
    }
  }

  function renderBookmarks() {
    bookmarkList.innerHTML = "";
    bookmarkEmpty.style.display = bookmarks.length ? "none" : "block";

    bookmarks.forEach((bookmark, index) => {
      const item = document.createElement("div");
      item.className = "bookmark-item";

      const saveBookmarkTitle = (nextTitle) => {
        const trimmedTitle = nextTitle.trim();

        if (!trimmedTitle) {
          editingBookmarkIndex = null;
          renderBookmarks();
          return;
        }

        bookmarks = bookmarks.map((item, bookmarkIndex) =>
          bookmarkIndex === index ? { ...item, title: trimmedTitle } : item
        );
        editingBookmarkIndex = null;
        chrome.storage.sync.set({ bookmarks }, renderBookmarks);
      };

      if (editingBookmarkIndex === index) {
        const editField = document.createElement("input");
        editField.type = "text";
        editField.className = "bookmark-input";
        editField.value = bookmark.title;
        editField.setAttribute("aria-label", "Bookmark name");
        editField.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            saveBookmarkTitle(editField.value);
          }

          if (event.key === "Escape") {
            editingBookmarkIndex = null;
            renderBookmarks();
          }
        });
        editField.addEventListener("blur", () => {
          if (editingBookmarkIndex === index) {
            saveBookmarkTitle(editField.value);
          }
        });

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "bookmark-confirm";
        confirmButton.textContent = "✓";
        confirmButton.setAttribute("aria-label", "Save bookmark name");
        confirmButton.addEventListener("click", () => {
          saveBookmarkTitle(editField.value);
        });

        item.appendChild(editField);
        item.appendChild(confirmButton);

        bookmarkList.appendChild(item);

        window.requestAnimationFrame(() => {
          editField.focus();
          editField.select();
        });

        return;
      }

      const openButton = document.createElement("button");
      openButton.type = "button";
      openButton.className = "bookmark-link";
      openButton.textContent = bookmark.title;
      openButton.title = bookmark.url;
      openButton.addEventListener("click", () => {
        currentUrl = bookmark.url;
        currentTitle = bookmark.title;
        iframe.src = bookmark.url;
        bookmarkPanel.classList.add("hidden");
        bookmarkButton.classList.remove("is-active");
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "bookmark-remove";
      removeButton.textContent = "-";
      removeButton.setAttribute("aria-label", "Remove bookmark");
      removeButton.addEventListener("click", () => {
        bookmarks = bookmarks.filter((_, bookmarkIndex) => bookmarkIndex !== index);
        chrome.storage.sync.set({ bookmarks }, renderBookmarks);
      });

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "bookmark-edit";
      editButton.textContent = "✎";
      editButton.setAttribute("aria-label", "Rename bookmark");
      editButton.addEventListener("click", () => {
        editingBookmarkIndex = index;
        renderBookmarks();
      });

      item.appendChild(openButton);
      item.appendChild(editButton);
      item.appendChild(removeButton);
      bookmarkList.appendChild(item);
    });
  }

  function loadBookmarks() {
    chrome.storage.sync.get(["bookmarks"], (result) => {
      bookmarks = Array.isArray(result.bookmarks) ? result.bookmarks : [];
      renderBookmarks();
    });
  }

  // 뒤로가기 버튼 추가
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // 미니 스크린 헤더를 드래그해서 이동할 수 있도록 설정
  header.addEventListener("mousedown", (event) => {
    miniScreen.classList.add("is-interacting");
    const currentRect = miniScreen.getBoundingClientRect();
    miniScreen.style.left = `${currentRect.left}px`;
    miniScreen.style.top = `${currentRect.top}px`;
    miniScreen.style.transform = "none";
    const offsetX = event.clientX - currentRect.left;
    const offsetY = event.clientY - currentRect.top;
    const onMouseMove = (event) => {
      miniScreen.style.left = `${event.clientX - offsetX}px`;
      miniScreen.style.top = `${event.clientY - offsetY}px`;
    };
    const onMouseUp = () => {
      miniScreen.classList.remove("is-interacting");
      constrainMiniScreenToViewport();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  resizeHandle.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    miniScreen.classList.add("is-interacting");

    const startWidth = miniScreen.offsetWidth;
    const startHeight = miniScreen.offsetHeight;
    const startX = event.clientX;
    const startY = event.clientY;
    const { minWidth, minHeight, maxWidth, maxHeight } = getSizeConstraints();

    const onMouseMove = (moveEvent) => {
      const nextWidth = Math.min(
        Math.max(minWidth, startWidth + (moveEvent.clientX - startX)),
        maxWidth
      );
      const nextHeight = Math.min(
        Math.max(minHeight, startHeight + (moveEvent.clientY - startY)),
        maxHeight
      );

      miniScreen.style.width = `${nextWidth}px`;
      miniScreen.style.height = `${nextHeight}px`;
    };

    const onMouseUp = () => {
      miniScreen.classList.remove("is-interacting");
      constrainMiniScreenToViewport();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  chrome.storage.sync.get(["home"], (result) => {
    const defaultUrl = result.home || fallbackHomeUrl;
    currentUrl = defaultUrl;
    iframe.src = defaultUrl;
    console.log("Loading saved URL:", defaultUrl);
  });

  chrome.storage.sync.get(["viewMode"], (result) => {
    applyViewMode(result.viewMode || DEFAULT_VIEW_MODE);
    constrainMiniScreenToViewport();
  });

  loadBookmarks();

  iframe.addEventListener("load", () => {
    try {
      currentUrl = iframe.contentWindow.location.href;
      currentTitle = iframe.contentDocument?.title || getBookmarkTitle(currentUrl);
    } catch (error) {
      currentUrl = iframe.src || currentUrl;
      currentTitle = getBookmarkTitle(currentUrl);
    }
  });

  window.addEventListener("message", (event) => {
    if (
      event.source === iframe.contentWindow &&
      event.data?.type === "MINISCREEN_FRAME_URL"
    ) {
      currentUrl = event.data.href || currentUrl;
      currentTitle = event.data.title || getBookmarkTitle(currentUrl);
    }
  });
  
  let targetUrl;
  let isComposing = false;

  const navigateToInputValue = () => {
    if (!urlInput.value) {
      chrome.storage.sync.get(["home"], (result) => {
        currentUrl = result.home || fallbackHomeUrl;
        currentTitle = getBookmarkTitle(currentUrl);
        iframe.src = currentUrl;
      });
      return;
    } else {
      targetUrl = normalizeTargetUrl(urlInput.value);
    }
    urlInput.value = "";
    currentUrl = targetUrl;
    currentTitle = getBookmarkTitle(targetUrl);
    iframe.src = targetUrl;
  };

  goButton.addEventListener("click", navigateToInputValue);

  homeButton.addEventListener("click", () => {
    chrome.storage.sync.get(["home"], (result) => {
      const defaultUrl = result.home || fallbackHomeUrl;
      currentUrl = defaultUrl;
      currentTitle = getBookmarkTitle(defaultUrl);
      iframe.src = defaultUrl;
      console.log("Loading saved URL:", defaultUrl);
    });
  });

  homeButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    const targetUrl = urlInput.value ? normalizeTargetUrl(urlInput.value) : currentUrl;
    chrome.storage.sync.set({ home: targetUrl }, () => {
      urlInput.value = "";
      currentUrl = targetUrl;
      currentTitle = getBookmarkTitle(targetUrl);
      iframe.src = targetUrl;
      console.log("Saved new home URL:", targetUrl);
    });
  });

  bookmarkButton.addEventListener("click", () => {
    bookmarkPanel.classList.toggle("hidden");
    bookmarkButton.classList.toggle(
      "is-active",
      !bookmarkPanel.classList.contains("hidden")
    );
  });

  addBookmarkButton.addEventListener("click", () => {
    const targetUrl = currentUrl || iframe.src;

    if (!targetUrl) {
      return;
    }

    if (bookmarks.some((bookmark) => bookmark.url === targetUrl)) {
      bookmarkPanel.classList.add("hidden");
      bookmarkButton.classList.remove("is-active");
      return;
    }

    bookmarks = [
      { title: currentTitle || getBookmarkTitle(targetUrl), url: targetUrl },
      ...bookmarks,
    ].slice(0, 20);

    chrome.storage.sync.set({ bookmarks }, renderBookmarks);
  });

  document.addEventListener("mousedown", (event) => {
    if (
      !bookmarkPanel.classList.contains("hidden") &&
      !bookmarkPanel.contains(event.target) &&
      !bookmarkButton.contains(event.target)
    ) {
      bookmarkPanel.classList.add("hidden");
      bookmarkButton.classList.remove("is-active");
    }
  });

  window.addEventListener("resize", resetMiniScreenPosition);

  // 입력 시작 시 isComposing을 true로 설정
  urlInput.addEventListener("compositionstart", () => {
    isComposing = true;
  });

  // 입력 종료 시 isComposing을 false로 설정
  urlInput.addEventListener("compositionend", () => {
    isComposing = false;
  });

  // ENTER 키를 눌러도 페이지 이동
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isComposing) {
      event.preventDefault();
      navigateToInputValue();
    }
  });

  // CLOSE 버튼 클릭 시 MINISCREEN 종료
  closeButton.addEventListener("click", () => {
    miniScreen.remove();
  });

  viewModeButton.addEventListener("click", () => {
    const nextViewMode = currentViewMode === "mobile" ? "desktop" : "mobile";

    chrome.runtime.sendMessage(
      {
        type: "MINISCREEN_SET_VIEW_MODE",
        viewMode: nextViewMode,
      },
      (response) => {
        if (chrome.runtime.lastError || !response?.ok) {
          return;
        }

        applyViewMode(response.viewMode);
        constrainMiniScreenToViewport();
        iframe.src = currentUrl || iframe.src || fallbackHomeUrl;
      }
    );
  });


  document.body.appendChild(miniScreen);
}

init();
