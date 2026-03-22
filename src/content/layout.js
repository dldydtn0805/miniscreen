(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  function createLayoutController(context) {
    const { elements, appState } = context;
    const inputDragThreshold = 6;
    let restoredBounds = null;

    const createFrameScheduler = (applyStyles) => {
      let frameId = 0;
      let pendingStyles = null;

      const flush = () => {
        frameId = 0;

        if (!pendingStyles) {
          return;
        }

        const nextStyles = pendingStyles;
        pendingStyles = null;
        applyStyles(nextStyles);
      };

      return {
        schedule(nextStyles) {
          pendingStyles = nextStyles;

          if (frameId) {
            return;
          }

          frameId = window.requestAnimationFrame(flush);
        },

        flush() {
          if (!pendingStyles) {
            return;
          }

          if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
          }

          const nextStyles = pendingStyles;
          pendingStyles = null;
          applyStyles(nextStyles);
        },
      };
    };

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
      if (appState.isFullscreen) {
        return;
      }

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

    const syncFullscreenToViewport = () => {
      elements.miniScreen.classList.add("is-fullscreen");
      elements.miniScreen.style.left = "0px";
      elements.miniScreen.style.top = "0px";
      elements.miniScreen.style.width = `${window.innerWidth}px`;
      elements.miniScreen.style.height = `${window.innerHeight}px`;
      elements.miniScreen.style.bottom = "auto";
      elements.miniScreen.style.transform = "none";
    };

    const toggleFullscreen = () => {
      if (appState.isFullscreen) {
        appState.isFullscreen = false;
        elements.miniScreen.classList.remove("is-fullscreen");

        if (restoredBounds) {
          elements.miniScreen.style.left = `${restoredBounds.left}px`;
          elements.miniScreen.style.top = `${restoredBounds.top}px`;
          elements.miniScreen.style.width = `${restoredBounds.width}px`;
          elements.miniScreen.style.height = `${restoredBounds.height}px`;
          elements.miniScreen.style.bottom = "auto";
          elements.miniScreen.style.transform = "none";
          restoredBounds = null;
          constrainMiniScreenToViewport();
          return false;
        }

        resetMiniScreenPosition();
        constrainMiniScreenToViewport();
        return false;
      }

      const currentRect = elements.miniScreen.getBoundingClientRect();
      restoredBounds = {
        left: currentRect.left,
        top: currentRect.top,
        width: currentRect.width,
        height: currentRect.height,
      };

      appState.isFullscreen = true;
      syncFullscreenToViewport();
      return true;
    };

    const startDragInteraction = (startClientX, startClientY) => {
      elements.miniScreen.classList.add("is-interacting");

      const currentRect = elements.miniScreen.getBoundingClientRect();
      elements.miniScreen.style.left = `${currentRect.left}px`;
      elements.miniScreen.style.top = `${currentRect.top}px`;
      elements.miniScreen.style.bottom = "auto";
      elements.miniScreen.style.transform = "none";

      return {
        offsetX: startClientX - currentRect.left,
        offsetY: startClientY - currentRect.top,
        frameScheduler: createFrameScheduler(({ left, top }) => {
          elements.miniScreen.style.left = `${left}px`;
          elements.miniScreen.style.top = `${top}px`;
        }),
      };
    };

    const finishDragInteraction = (dragSession) => {
      if (!dragSession) {
        return;
      }

      dragSession.frameScheduler.flush();
      elements.miniScreen.classList.remove("is-interacting");
      constrainMiniScreenToViewport();
    };

    const isInteractiveHeaderTarget = (target) =>
      target instanceof Element && target.closest("button, input") !== null;

    const bindDrag = () => {
      elements.header.addEventListener("mousedown", (event) => {
        if (
          event.button !== 0 ||
          appState.isFullscreen ||
          isInteractiveHeaderTarget(event.target)
        ) {
          return;
        }

        event.preventDefault();
        const dragSession = startDragInteraction(event.clientX, event.clientY);

        const onMouseMove = (moveEvent) => {
          dragSession.frameScheduler.schedule({
            left: moveEvent.clientX - dragSession.offsetX,
            top: moveEvent.clientY - dragSession.offsetY,
          });
        };

        const onMouseUp = () => {
          finishDragInteraction(dragSession);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      elements.urlInput.addEventListener("mousedown", (event) => {
        if (event.button !== 0 || appState.isFullscreen) {
          return;
        }

        const startClientX = event.clientX;
        const startClientY = event.clientY;
        let dragSession = null;

        const onMouseMove = (moveEvent) => {
          if (!dragSession) {
            const deltaX = moveEvent.clientX - startClientX;
            const deltaY = moveEvent.clientY - startClientY;

            if (Math.hypot(deltaX, deltaY) < inputDragThreshold) {
              return;
            }

            elements.urlInput.blur();
            dragSession = startDragInteraction(startClientX, startClientY);
          }

          dragSession.frameScheduler.schedule({
            left: moveEvent.clientX - dragSession.offsetX,
            top: moveEvent.clientY - dragSession.offsetY,
          });
        };

        const onMouseUp = () => {
          finishDragInteraction(dragSession);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    };

    const bindResize = () => {
      elements.resizeHandle.addEventListener("mousedown", (event) => {
        if (appState.isFullscreen) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        elements.miniScreen.classList.add("is-interacting");

        const startWidth = elements.miniScreen.offsetWidth;
        const startHeight = elements.miniScreen.offsetHeight;
        const startX = event.clientX;
        const startY = event.clientY;
        const { minWidth, minHeight, maxWidth, maxHeight } = getSizeConstraints();
        const frameScheduler = createFrameScheduler(({ width, height }) => {
          elements.miniScreen.style.width = `${width}px`;
          elements.miniScreen.style.height = `${height}px`;
        });

        const onMouseMove = (moveEvent) => {
          const nextWidth = Math.min(
            Math.max(minWidth, startWidth + (moveEvent.clientX - startX)),
            maxWidth
          );
          const nextHeight = Math.min(
            Math.max(minHeight, startHeight + (moveEvent.clientY - startY)),
            maxHeight
          );

          frameScheduler.schedule({
            width: nextWidth,
            height: nextHeight,
          });
        };

        const onMouseUp = () => {
          frameScheduler.flush();
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
      syncFullscreenToViewport,
      toggleFullscreen,
    };
  }

  state.layout = { createLayoutController };
})();
