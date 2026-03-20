const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get("scene") || "bookmarks";

  await wait(1200);

  const panel = document.getElementById("miniscreen");
  const bookmarkButton = document.getElementById("bookmark-button");
  const viewModeButton = document.getElementById("view-mode-button");

  if (!panel || !bookmarkButton || !viewModeButton) {
    throw new Error("MINISCREEN demo UI did not initialize.");
  }

  panel.style.left = "calc(100vw - 420px)";
  panel.style.top = "44px";
  panel.style.width = "360px";
  panel.style.height = "760px";
  panel.style.transform = "none";

  await wait(300);

  if (scene === "desktop") {
    if (viewModeButton.textContent !== "W") {
      viewModeButton.click();
      await wait(400);
    }

    panel.style.left = "calc(100vw - 760px)";
    panel.style.width = "700px";
    panel.style.height = "720px";
    document.body.setAttribute("data-shot", "desktop");
    return;
  }

  bookmarkButton.click();
  await wait(300);
  document.body.setAttribute("data-shot", "bookmarks");
}

run().catch((error) => {
  console.error(error);
  document.body.setAttribute("data-shot", "error");
});
