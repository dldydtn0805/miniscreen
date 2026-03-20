(function () {
  const state = (globalThis.MINISCREEN_CONTENT =
    globalThis.MINISCREEN_CONTENT || {});

  function createMiniScreen() {
    const miniScreen = document.createElement("div");
    miniScreen.id = "miniscreen";
    miniScreen.innerHTML = `
      <div class="mini-screen-header">
        <button id="close-button" class="button-with-icon">X</button>
        <button id="back-button" class="button-with-icon"><</button>
        <button id="home-button" class="button-with-icon">⌂</button>
        <input type="text" id="url-input" placeholder="SEARCH WORD OR URL">
        <button id="go-button" class="button-with-icon">></button>
        <button id="bookmark-button" class="button-with-icon">★</button>
        <button id="view-mode-button" class="button-with-icon" type="button">M</button>
      </div>
      <div id="bookmark-panel" class="bookmark-panel hidden">
        <div class="bookmark-panel-header">
          <div class="bookmark-panel-heading">
            <span class="bookmark-panel-eyebrow">Library</span>
            <strong>Bookmarks</strong>
            <p class="bookmark-panel-copy">Keep your favorite pages close and open them in one tap.</p>
          </div>
          <button id="add-bookmark-button" type="button" aria-label="Add current page">+</button>
        </div>
        <div id="bookmark-empty" class="bookmark-empty">No bookmarks yet.</div>
        <div id="bookmark-list" class="bookmark-list"></div>
      </div>
      <iframe id="mini-iframe" referrerpolicy="unsafe-url"></iframe>
      <div id="resize-handle" aria-hidden="true"></div>
    `;

    return {
      miniScreen,
      urlInput: miniScreen.querySelector("#url-input"),
      backButton: miniScreen.querySelector("#back-button"),
      goButton: miniScreen.querySelector("#go-button"),
      closeButton: miniScreen.querySelector("#close-button"),
      viewModeButton: miniScreen.querySelector("#view-mode-button"),
      bookmarkButton: miniScreen.querySelector("#bookmark-button"),
      bookmarkPanel: miniScreen.querySelector("#bookmark-panel"),
      bookmarkList: miniScreen.querySelector("#bookmark-list"),
      bookmarkEmpty: miniScreen.querySelector("#bookmark-empty"),
      addBookmarkButton: miniScreen.querySelector("#add-bookmark-button"),
      iframe: miniScreen.querySelector("#mini-iframe"),
      header: miniScreen.querySelector(".mini-screen-header"),
      homeButton: miniScreen.querySelector("#home-button"),
      resizeHandle: miniScreen.querySelector("#resize-handle"),
    };
  }

  state.dom = { createMiniScreen };
})();
