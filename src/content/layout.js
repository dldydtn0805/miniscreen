(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  function createLayoutController(context) {
    const { elements, appState } = context;

    const getSizeConstraints = () => {
      const margin = 12;
      const { minWidth, minHeight } =
        appState.currentViewMode === "desktop"
          ? { minWidth: 280, minHeight: 200 }
          : { minWidth: 280, minHeight: 320 };

      return {
        margin,
        minWidth,
        minHeight,
        maxWidth: Math.max(minWidth, window.innerWidth - margin * 2),
        maxHeight: Math.max(minHeight, window.innerHeight - margin * 2),
      };
    };

    const resetMiniScreenPosition = () => {
      elements.miniScreen.style.left = "";
      elements.miniScreen.style.top = "50%";
      elements.miniScreen.style.bottom = "auto";
      elements.miniScreen.style.transform = "translateY(-50%)";
    };

    const constrainMiniScreenToViewport = () => {
      const { margin, minWidth, minHeight, maxWidth, maxHeight } =
        getSizeConstraints();
      const currentRect = elements.miniScreen.getBoundingClientRect();
      const nextWidth = Math.min(Math.max(currentRect.width, minWidth), maxWidth);
      const nextHeight = Math.min(
        Math.max(currentRect.height, minHeight),
        maxHeight
      );

      let nextLeft = currentRect.left;
      let nextTop = currentRect.top;

      if (currentRect.width !== nextWidth) {
        elements.miniScreen.style.width = `${nextWidth}px`;
        nextLeft = Math.min(nextLeft, window.innerWidth - nextWidth - margin);
      }

      if (currentRect.height !== nextHeight) {
        elements.miniScreen.style.height = `${nextHeight}px`;
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

      elements.miniScreen.style.left = `${nextLeft}px`;
      elements.miniScreen.style.top = `${nextTop}px`;
      elements.miniScreen.style.bottom = "auto";
      elements.miniScreen.style.transform = "none";
    };

    const bindDrag = () => {
      elements.header.addEventListener("mousedown", (event) => {
        elements.miniScreen.classList.add("is-interacting");
        const currentRect = elements.miniScreen.getBoundingClientRect();
        elements.miniScreen.style.left = `${currentRect.left}px`;
        elements.miniScreen.style.top = `${currentRect.top}px`;
        elements.miniScreen.style.transform = "none";
        const offsetX = event.clientX - currentRect.left;
        const offsetY = event.clientY - currentRect.top;

        const onMouseMove = (moveEvent) => {
          elements.miniScreen.style.left = `${moveEvent.clientX - offsetX}px`;
          elements.miniScreen.style.top = `${moveEvent.clientY - offsetY}px`;
        };

        const onMouseUp = () => {
          elements.miniScreen.classList.remove("is-interacting");
          constrainMiniScreenToViewport();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    };

    const bindResize = () => {
      elements.resizeHandle.addEventListener("mousedown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        elements.miniScreen.classList.add("is-interacting");

        const startWidth = elements.miniScreen.offsetWidth;
        const startHeight = elements.miniScreen.offsetHeight;
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

          elements.miniScreen.style.width = `${nextWidth}px`;
          elements.miniScreen.style.height = `${nextHeight}px`;
        };

        const onMouseUp = () => {
          elements.miniScreen.classList.remove("is-interacting");
          constrainMiniScreenToViewport();
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    };

    bindDrag();
    bindResize();

    return {
      constrainMiniScreenToViewport,
      resetMiniScreenPosition,
    };
  }

  state.layout = { createLayoutController };
})();
