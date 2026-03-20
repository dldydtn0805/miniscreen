(function () {
  if (window.top === window) {
    return;
  }

  const postFrameLocation = () => {
    window.top.postMessage(
      {
        type: "MINISCREEN_FRAME_URL",
        href: window.location.href,
        title: document.title,
      },
      "*"
    );
  };

  const navigateWithinFrame = (url) => {
    if (!url) {
      return;
    }

    try {
      window.location.assign(new URL(url, window.location.href).toString());
    } catch (error) {
      window.location.assign(url);
    }
  };

  const wrapHistoryMethod = (methodName) => {
    const originalMethod = history[methodName];

    history[methodName] = function (...args) {
      const returnValue = originalMethod.apply(this, args);
      postFrameLocation();
      return returnValue;
    };
  };

  window.addEventListener("load", postFrameLocation);
  window.addEventListener("pageshow", postFrameLocation);
  window.addEventListener("hashchange", postFrameLocation);

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");

  document.addEventListener(
    "click",
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = event.target.closest("a[href]");

      if (!link) {
        return;
      }

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      const target = (link.getAttribute("target") || "").toLowerCase();

      if (target === "_top" || target === "_parent" || target === "_blank") {
        event.preventDefault();
        navigateWithinFrame(link.href);
      }
    },
    true
  );

  const originalWindowOpen = window.open;
  window.open = function (url, target, features) {
    if (target === "_blank" || target === "_top" || target === "_parent") {
      navigateWithinFrame(url);
      return window;
    }

    return originalWindowOpen.call(window, url, target, features);
  };

  postFrameLocation();
})();
