(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});
  const { fallbackHomeUrl, searchUrl } = state.constants;

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
  };
})();
