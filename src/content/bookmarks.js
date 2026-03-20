(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const { getBookmarkTitle } = state.utils;
  const { maxBookmarks } = state.constants;
  const storage = state.storage;

  function createBookmarkStore(context) {
    const { elements, appState } = context;
    let editingBookmarkIndex = null;

    const renderBookmarks = () => {
      elements.bookmarkList.innerHTML = "";
      elements.bookmarkEmpty.style.display = appState.bookmarks.length
        ? "none"
        : "block";

      appState.bookmarks.forEach((bookmark, index) => {
        const item = document.createElement("div");
        item.className = "bookmark-item";

        const saveBookmarkTitle = async (nextTitle) => {
          const trimmedTitle = nextTitle.trim();

          if (!trimmedTitle) {
            editingBookmarkIndex = null;
            renderBookmarks();
            return;
          }

          appState.bookmarks = appState.bookmarks.map((entry, bookmarkIndex) =>
            bookmarkIndex === index ? { ...entry, title: trimmedTitle } : entry
          );
          editingBookmarkIndex = null;
          await storage.saveBookmarks(appState.bookmarks);
          renderBookmarks();
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
          elements.bookmarkList.appendChild(item);

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
          appState.currentUrl = bookmark.url;
          appState.currentTitle = bookmark.title;
          elements.iframe.src = bookmark.url;
          elements.bookmarkPanel.classList.add("hidden");
          elements.bookmarkButton.classList.remove("is-active");
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "bookmark-remove";
        removeButton.textContent = "-";
        removeButton.setAttribute("aria-label", "Remove bookmark");
        removeButton.addEventListener("click", () => {
          appState.bookmarks = appState.bookmarks.filter(
            (_, bookmarkIndex) => bookmarkIndex !== index
          );
          storage.saveBookmarks(appState.bookmarks).then(renderBookmarks);
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
        elements.bookmarkList.appendChild(item);
      });
    };

    return {
      renderBookmarks,

      async loadBookmarks() {
        appState.bookmarks = await storage.getBookmarks();
        renderBookmarks();
      },

      addCurrentBookmark() {
        const targetUrl = appState.currentUrl || elements.iframe.src;

        if (!targetUrl) {
          return;
        }

        if (appState.bookmarks.some((bookmark) => bookmark.url === targetUrl)) {
          elements.bookmarkPanel.classList.add("hidden");
          elements.bookmarkButton.classList.remove("is-active");
          return;
        }

        appState.bookmarks = [
          {
            title: appState.currentTitle || getBookmarkTitle(targetUrl),
            url: targetUrl,
          },
          ...appState.bookmarks,
        ].slice(0, maxBookmarks);

        storage.saveBookmarks(appState.bookmarks).then(renderBookmarks);
      },
    };
  }

  state.bookmarks = { createBookmarkStore };
})();
