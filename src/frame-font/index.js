(function () {
  if (window.top === window) {
    return;
  }

  const FRAME_APPLY_FONT_MESSAGE = "MINISCREEN_FRAME_APPLY_FONT";
  const MINISCREEN_FONT_STYLE_ID = "miniscreen-font-override";
  const FONT_URL = chrome.runtime.getURL("src/assets/fonts/neodgm.woff2");

  const applyMiniscreenFont = () => {
    const root = document.head || document.documentElement;

    if (!root) {
      return;
    }

    let style = document.getElementById(MINISCREEN_FONT_STYLE_ID);

    if (!(style instanceof HTMLStyleElement)) {
      style = document.createElement("style");
      style.id = MINISCREEN_FONT_STYLE_ID;
      root.appendChild(style);
    }

    style.textContent = `
      @font-face {
        font-family: "NeoDunggeunmo";
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url("${FONT_URL}") format("woff2");
      }

      html, body, body * {
        font-family: "NeoDunggeunmo", sans-serif !important;
      }

      svg, svg *, canvas, canvas *, code, pre, kbd, samp {
        font-family: initial !important;
      }
    `;
  };

  window.addEventListener("message", (event) => {
    if (
      event.source === window.top &&
      event.data?.type === FRAME_APPLY_FONT_MESSAGE
    ) {
      applyMiniscreenFont();
    }
  });
})();
