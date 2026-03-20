(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  state.constants = {
    fallbackHomeUrl: "https://www.google.com/",
    defaultViewMode: "mobile",
    searchUrl:
      "https://duckduckgo.com/?ia=web&origin=funnel_home_website&t=h_&q=",
    maxBookmarks: 20,
  };
})();
