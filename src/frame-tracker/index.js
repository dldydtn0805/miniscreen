(function () {
  if (window.top === window) {
    return;
  }

  const NAVIGATION_TARGET_SELECTOR =
    'a[href], area[href], form[action], [onclick], input[type="hidden"][value]';
  const FRAME_NAVIGATE_BACK_MESSAGE = "MINISCREEN_FRAME_NAVIGATE_BACK";
  const BLOCKED_SCRIPT_PATTERNS = [/^https?:\/\/(?:[^/]+\.)?excavatenearbywand\.com(?:\/|$)/i];
  let lastPostedHref = "";
  let lastPostedTitle = "";

  const postFrameLocation = () => {
    const href = window.location.href;
    const title = document.title;

    if (href === lastPostedHref && title === lastPostedTitle) {
      return;
    }

    lastPostedHref = href;
    lastPostedTitle = title;

    window.top.postMessage(
      {
        type: "MINISCREEN_FRAME_URL",
        href,
        title,
      },
      "*"
    );
  };

  const navigateWithinFrame = (url) => {
    if (!url) {
      return;
    }

    let nextUrl = url;

    try {
      nextUrl = new URL(url, window.location.href).toString();
    } catch (error) {
      nextUrl = url;
    }

    window.location.assign(upgradeNavigationUrl(nextUrl));
  };

  const shouldPreferHttps = window.location.protocol === "https:";

  const upgradeNavigationUrl = (value) => {
    if (!shouldPreferHttps || typeof value !== "string") {
      return value;
    }

    try {
      const nextUrl = new URL(value, window.location.href);

      if (
        nextUrl.protocol === "http:" &&
        nextUrl.hostname === window.location.hostname
      ) {
        nextUrl.protocol = "https:";
        return nextUrl.toString();
      }
    } catch (error) {
      return value;
    }

    return value;
  };

  const upgradeNavigationText = (value) => {
    if (
      !shouldPreferHttps ||
      typeof value !== "string" ||
      !value.includes("http://")
    ) {
      return value;
    }

    return value.replace(/http:\/\/[^\s"'`)<]+/gi, (match) =>
      upgradeNavigationUrl(match)
    );
  };

  const syncAttribute = (element, attributeName, nextValue) => {
    if (typeof nextValue !== "string") {
      return;
    }

    const currentValue = element.getAttribute(attributeName);

    if (currentValue !== nextValue) {
      element.setAttribute(attributeName, nextValue);
    }
  };

  const upgradeNavigationAttributes = (element) => {
    if (!shouldPreferHttps || !(element instanceof Element)) {
      return;
    }

    if (element.matches("a[href], area[href]")) {
      const href = element.getAttribute("href");
      const nextHref = upgradeNavigationUrl(href);

      if (nextHref !== href) {
        syncAttribute(element, "href", nextHref);
      }
    }

    if (element.matches("form[action]")) {
      const action = element.getAttribute("action");
      const nextAction = upgradeNavigationUrl(action);

      if (nextAction !== action) {
        syncAttribute(element, "action", nextAction);
      }
    }

    if (element.matches("[onclick]")) {
      const onclick = element.getAttribute("onclick");
      const nextOnclick = upgradeNavigationText(onclick);

      if (nextOnclick !== onclick) {
        syncAttribute(element, "onclick", nextOnclick);
      }
    }

    if (element.matches('input[type="hidden"][value]')) {
      const nextValue = upgradeNavigationText(element.value);

      if (nextValue !== element.value) {
        element.value = nextValue;
        syncAttribute(element, "value", nextValue);
      }
    }
  };

  const upgradeNavigationTargetsInTree = (root) => {
    if (!shouldPreferHttps) {
      return;
    }

    upgradeNavigationAttributes(root);

    if (!(root instanceof Element) && !(root instanceof Document)) {
      return;
    }

    root
      .querySelectorAll(NAVIGATION_TARGET_SELECTOR)
      .forEach((element) => {
        upgradeNavigationAttributes(element);
      });
  };

  const queueNavigationRoot = (pendingRoots, node) => {
    if (!(node instanceof Element)) {
      return;
    }

    for (const pendingRoot of pendingRoots) {
      if (pendingRoot === node || pendingRoot.contains(node)) {
        return;
      }
    }

    for (const pendingRoot of Array.from(pendingRoots)) {
      if (node.contains(pendingRoot)) {
        pendingRoots.delete(pendingRoot);
      }
    }

    pendingRoots.add(node);
  };

  const observeNavigationTargets = () => {
    if (!shouldPreferHttps || !document.documentElement) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      const pendingRoots = new Set();

      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          upgradeNavigationAttributes(mutation.target);
          return;
        }

        mutation.addedNodes.forEach((node) => {
          queueNavigationRoot(pendingRoots, node);
        });
      });

      pendingRoots.forEach((root) => {
        upgradeNavigationTargetsInTree(root);
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["href", "action", "onclick", "value"],
    });
  };

  const normalizeBrowsingContextTarget = (value) => {
    if (typeof value !== "string") {
      return "";
    }

    return value.trim().toLowerCase();
  };

  const shouldKeepNavigationInFrame = (targetValue) => {
    const normalizedTarget = normalizeBrowsingContextTarget(targetValue);
    return normalizedTarget !== "" && normalizedTarget !== "_self";
  };

  const restoreAttribute = (element, attributeName, previousValue) => {
    if (!(element instanceof Element)) {
      return;
    }

    if (previousValue === null) {
      element.removeAttribute(attributeName);
      return;
    }

    element.setAttribute(attributeName, previousValue);
  };

  const forceFormTargetToSelf = (form, submitter) => {
    const pendingRestores = [];

    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    if (
      submitter instanceof HTMLElement &&
      shouldKeepNavigationInFrame(submitter.getAttribute("formtarget"))
    ) {
      const previousSubmitterTarget = submitter.getAttribute("formtarget");
      submitter.setAttribute("formtarget", "_self");
      pendingRestores.push(() => {
        restoreAttribute(submitter, "formtarget", previousSubmitterTarget);
      });
    }

    if (shouldKeepNavigationInFrame(form.getAttribute("target"))) {
      const previousFormTarget = form.getAttribute("target");
      form.setAttribute("target", "_self");
      pendingRestores.push(() => {
        restoreAttribute(form, "target", previousFormTarget);
      });
    }

    if (!pendingRestores.length) {
      return;
    }

    window.setTimeout(() => {
      pendingRestores.forEach((restore) => {
        restore();
      });
    }, 0);
  };

  const normalizeScriptUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
      return "";
    }

    try {
      return new URL(value, window.location.href).toString();
    } catch (error) {
      return value.trim();
    }
  };

  const isBlockedScriptUrl = (value) => {
    const normalizedUrl = normalizeScriptUrl(value);

    if (!normalizedUrl) {
      return false;
    }

    return BLOCKED_SCRIPT_PATTERNS.some((pattern) => pattern.test(normalizedUrl));
  };

  const shouldBlockScriptElement = (script) => {
    if (!(script instanceof HTMLScriptElement)) {
      return false;
    }

    return (
      isBlockedScriptUrl(script.src) ||
      isBlockedScriptUrl(script.getAttribute("src")) ||
      script.dataset.clocid === "2083621"
    );
  };

  const neutralizeScriptElement = (script) => {
    script.removeAttribute("src");
    script.textContent = "";
    script.type = "application/miniscreen-blocked-script";
    script.dataset.miniscreenBlocked = "true";
    script.onload = null;
    script.onerror = null;
  };

  const blockScriptsInSubtree = (node) => {
    if (node instanceof HTMLScriptElement && shouldBlockScriptElement(node)) {
      neutralizeScriptElement(node);
      return true;
    }

    if (!(node instanceof Element) && !(node instanceof DocumentFragment)) {
      return false;
    }

    let blockedAnyScript = false;

    if ("querySelectorAll" in node) {
      node.querySelectorAll("script").forEach((script) => {
        if (shouldBlockScriptElement(script)) {
          neutralizeScriptElement(script);
          blockedAnyScript = true;
        }
      });
    }

    return blockedAnyScript;
  };

  const installBlockedScriptGuards = () => {
    const wrapNodeInsertion = (prototype, methodName) => {
      const originalMethod = prototype[methodName];

      if (typeof originalMethod !== "function") {
        return;
      }

      prototype[methodName] = function (...args) {
        const [node] = args;

        if (blockScriptsInSubtree(node)) {
          return node;
        }

        return originalMethod.apply(this, args);
      };
    };

    wrapNodeInsertion(Node.prototype, "appendChild");
    wrapNodeInsertion(Node.prototype, "insertBefore");
    wrapNodeInsertion(Node.prototype, "replaceChild");

    if (typeof Element.prototype.append === "function") {
      const originalAppend = Element.prototype.append;

      Element.prototype.append = function (...nodes) {
        const allowedNodes = nodes.filter((node) => !blockScriptsInSubtree(node));

        if (!allowedNodes.length) {
          return;
        }

        return originalAppend.apply(this, allowedNodes);
      };
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
  window.addEventListener("load", () => {
    upgradeNavigationTargetsInTree(document);
  });

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");

  window.addEventListener("message", (event) => {
    if (
      event.source === window.top &&
      event.data?.type === FRAME_NAVIGATE_BACK_MESSAGE
    ) {
      window.history.back();
    }
  });

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

      const eventTarget = event.target instanceof Element ? event.target : null;
      const link = eventTarget?.closest("a[href], area[href]");

      if (!link) {
        return;
      }

      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      if (link.hasAttribute("download")) {
        return;
      }

      if (shouldKeepNavigationInFrame(link.getAttribute("target"))) {
        event.preventDefault();
        navigateWithinFrame(link.href);
      }
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;

      if (!(form instanceof HTMLFormElement)) {
        return;
      }

      forceFormTargetToSelf(form, event.submitter);
    },
    true
  );

  let nativeWindowOpen =
    typeof window.open === "function" ? window.open.bind(window) : null;

  const miniscreenWindowOpen = function (url, target, features) {
    if (normalizeBrowsingContextTarget(target) !== "_self") {
      navigateWithinFrame(url);
      return window;
    }

    if (!nativeWindowOpen) {
      return null;
    }

    return nativeWindowOpen(url, target, features);
  };

  const installWindowOpenOverride = () => {
    try {
      Object.defineProperty(window, "open", {
        configurable: true,
        enumerable: true,
        get() {
          return miniscreenWindowOpen;
        },
        set(nextOpen) {
          if (typeof nextOpen === "function") {
            nativeWindowOpen = nextOpen.bind(window);
          }
        },
      });
    } catch (error) {
      window.open = miniscreenWindowOpen;
    }
  };

  postFrameLocation();
  installBlockedScriptGuards();
  installWindowOpenOverride();
  upgradeNavigationTargetsInTree(document);
  observeNavigationTargets();
})();
