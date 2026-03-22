(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  state.constants = {
    fallbackHomeUrl: "https://www.google.com/",
    defaultViewMode: "mobile",
    searchUrl: "https://www.google.com/search?q=",
    maxBookmarks: 20,
  };
})();
