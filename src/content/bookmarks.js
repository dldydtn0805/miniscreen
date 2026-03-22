(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  function createBookmarkStore(context) {
    const { elements, appState, services } = context;
    let editingBookmarkIndex = null;
    let draggingBookmarkIndex = null;
    let dragOverBookmarkIndex = null;
    let dragOverPosition = null;

    const syncDragStateClasses = () => {
      Array.from(elements.bookmarkList.children).forEach((item, index) => {
        item.classList.toggle("is-dragging", index === draggingBookmarkIndex);
        item.classList.toggle(
          "drop-before",
          index === dragOverBookmarkIndex && dragOverPosition === "before"
        );
        item.classList.toggle(
          "drop-after",
          index === dragOverBookmarkIndex && dragOverPosition === "after"
        );
      });
    };

    const resetDragState = () => {
      draggingBookmarkIndex = null;
      dragOverBookmarkIndex = null;
      dragOverPosition = null;
      syncDragStateClasses();
    };

    const getDropPosition = (item, clientY) => {
      const { top, height } = item.getBoundingClientRect();
      return clientY < top + height / 2 ? "before" : "after";
    };

    const renderBookmarks = () => {
      elements.bookmarkList.innerHTML = "";
      elements.bookmarkEmpty.style.display = appState.bookmarks.length
        ? "none"
        : "block";

      appState.bookmarks.forEach((bookmark, index) => {
        const item = document.createElement("div");
        item.className = "bookmark-item";
        item.draggable = editingBookmarkIndex === null;

        const saveBookmarkTitle = async (nextTitle) => {
          const saved = await services.renameBookmark(index, nextTitle);

          if (!saved) {
            editingBookmarkIndex = null;
            renderBookmarks();
            return;
          }

          editingBookmarkIndex = null;
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

        item.addEventListener("dragstart", (event) => {
          if (editingBookmarkIndex !== null) {
            event.preventDefault();
            return;
          }

          draggingBookmarkIndex = index;
          dragOverBookmarkIndex = null;
          dragOverPosition = null;

          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
          }

          syncDragStateClasses();
        });

        item.addEventListener("dragover", (event) => {
          if (draggingBookmarkIndex === null || draggingBookmarkIndex === index) {
            return;
          }

          event.preventDefault();
          dragOverBookmarkIndex = index;
          dragOverPosition = getDropPosition(item, event.clientY);

          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move";
          }

          syncDragStateClasses();
        });

        item.addEventListener("drop", async (event) => {
          if (draggingBookmarkIndex === null) {
            return;
          }

          event.preventDefault();

          const dropPosition = getDropPosition(item, event.clientY);
          const didReorder = await services.reorderBookmarks(
            draggingBookmarkIndex,
            dropPosition === "before" ? index : index + 1
          );

          resetDragState();

          if (didReorder) {
            renderBookmarks();
          }
        });

        item.addEventListener("dragend", () => {
          resetDragState();
        });

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "bookmark-link";
        openButton.draggable = false;
        openButton.textContent = bookmark.title;
        openButton.title = bookmark.url;
        openButton.addEventListener("click", () => {
          services.openBookmark(bookmark);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "bookmark-remove";
        removeButton.draggable = false;
        removeButton.textContent = "-";
        removeButton.setAttribute("aria-label", "Remove bookmark");
        removeButton.addEventListener("click", async () => {
          await services.removeBookmark(index);
          renderBookmarks();
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "bookmark-edit";
        editButton.draggable = false;
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

      syncDragStateClasses();
    };

    elements.bookmarkList.addEventListener("dragover", (event) => {
      if (draggingBookmarkIndex === null) {
        return;
      }

      event.preventDefault();

      const lastBookmarkItem =
        elements.bookmarkList.lastElementChild instanceof HTMLElement
          ? elements.bookmarkList.lastElementChild
          : null;

      if (!lastBookmarkItem) {
        return;
      }

      const { bottom } = lastBookmarkItem.getBoundingClientRect();

      if (event.clientY >= bottom) {
        dragOverBookmarkIndex = appState.bookmarks.length - 1;
        dragOverPosition = "after";
        syncDragStateClasses();
      }
    });

    elements.bookmarkList.addEventListener("drop", async (event) => {
      if (draggingBookmarkIndex === null) {
        return;
      }

      const targetItem =
        event.target instanceof Element
          ? event.target.closest(".bookmark-item")
          : null;

      if (targetItem) {
        return;
      }

      event.preventDefault();

      const didReorder = await services.reorderBookmarks(
        draggingBookmarkIndex,
        appState.bookmarks.length
      );

      resetDragState();

      if (didReorder) {
        renderBookmarks();
      }
    });

    return {
      renderBookmarks,

      async loadBookmarks() {
        await services.loadBookmarks();
        renderBookmarks();
      },

      async addCurrentBookmark() {
        await services.addCurrentBookmark();
        renderBookmarks();
      },
    };
  }

  state.bookmarks = { createBookmarkStore };
})();
