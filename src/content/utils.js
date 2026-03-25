(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const { fallbackHomeUrl, searchUrl } = state.constants;
  const FRAME_NAME_MUTED_PATTERN = /(?:^|\s)__MINISCREEN_MUTED__=[01](?=\s|$)/g;

  state.utils = {
    normalizeTargetUrl(rawValue) {
      if (!rawValue) {
        return fallbackHomeUrl;
      }

      if (!rawValue.includes(".")) {
        return `${searchUrl}${encodeURIComponent(rawValue)}`;
      }

      return rawValue.startsWith("http://") || rawValue.startsWith("https://")
        ? rawValue
        : `https://${rawValue}`;
    },

    getBookmarkTitle(url) {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.replace(/^www\./, "");
      } catch (error) {
        return url;
      }
    },

    updateFrameNameMutedState(frameName, isMuted) {
      const sanitizedFrameName =
        typeof frameName === "string" ? frameName : String(frameName || "");
      const baseFrameName = sanitizedFrameName
        .replace(FRAME_NAME_MUTED_PATTERN, "")
        .trim();

      return `${baseFrameName}${baseFrameName ? " " : ""}__MINISCREEN_MUTED__=${
        isMuted ? "1" : "0"
      }`;
    },
  };
})();
