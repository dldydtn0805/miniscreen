function init() {
  // MINISCREEN이 이미 존재하면 초기화 하지 않음
  if (document.getElementById("miniscreen")) {
    return;
  }

  // MINISCREEN을 위한 DIV를 생성
  const miniScreen = document.createElement("div");
  miniScreen.id = "miniscreen";
  // 미니 스크린의 HTML 내용 설정
  miniScreen.innerHTML = `
    <div class="mini-screen-header">
      <button id="close-button" class="button-with-icon">X</button>
      <button id="home-button" class="button-with-icon">⌂</button>
      <button id="back-button" class="button-with-icon"><</button>
      <button id="go-button" class="button-with-icon">></button>
      <input type="text" id="url-input" placeholder="SEARCH WORD OR URL">
    </div>
    <iframe id="mini-iframe" sandbox="allow-same-origin allow-scripts"></iframe>
  `;

  // DOM 요소들 가져오기
  const urlInput = miniScreen.querySelector("#url-input");
  const backButton = miniScreen.querySelector("#back-button");
  const goButton = miniScreen.querySelector("#go-button");
  const closeButton = miniScreen.querySelector("#close-button");
  const iframe = miniScreen.querySelector("#mini-iframe");
  const header = miniScreen.querySelector(".mini-screen-header");
  const homeButton = miniScreen.querySelector("#home-button")

  

  // 뒤로가기 버튼 추가
  backButton.addEventListener("click", () => {
    window.history.back();
  });

  // 미니 스크린 헤더를 드래그해서 이동할 수 있도록 설정
  header.addEventListener("mousedown", (event) => {
    const offsetX = event.clientX - miniScreen.getBoundingClientRect().left;
    const offsetY = event.clientY - miniScreen.getBoundingClientRect().top;
    const onMouseMove = (event) => {
      miniScreen.style.left = `${event.clientX - offsetX}px`;
      miniScreen.style.top = `${event.clientY - offsetY}px`;
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  chrome.storage.sync.get(["home"], (result) => {
    const defaultUrl = result.home || "https://wikipedia.com";
    iframe.src = defaultUrl;
    console.log("Loading saved URL:", defaultUrl);
  });
  
  // GO 버튼 클릭 시 페이지를 이동
  let targetUrl;
  let isComposing = false;

  goButton.addEventListener("click", () => {
    if (!urlInput.value) {
      targetUrl = defaultURL;
    } else if (!urlInput.value.includes(".")) {
      const queryParams = encodeURIComponent(urlInput.value);
      targetUrl = `https://www.google.com/search?q=${queryParams}`;
    } else {
      targetUrl =
        urlInput.value.startsWith("http://") ||
        urlInput.value.startsWith("https://")
          ? urlInput.value
          : "https://" + urlInput.value;
    }
    urlInput.value = "";
    iframe.src = targetUrl;
  });

  homeButton.addEventListener("click", () => {
    if (!urlInput.value) {
        // URL이 비어있을 때
        chrome.storage.sync.get(["home"], (result) => {
            const defaultUrl = result.home || "https://wikipedia.com";
            iframe.src = defaultUrl;
            console.log("Loading saved URL:", defaultUrl);
        });
    } else {
        // 새 URL 저장할 때
        let targetUrl = urlInput.value;
        
        // URL이 http:// 나 https://로 시작하지 않으면 https:// 추가
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        chrome.storage.sync.set({ home: targetUrl }, () => {
            console.log("Saved new home URL:", targetUrl);
        });
        
        iframe.src = targetUrl;
        urlInput.value = "";
    }
  });

  // 입력 시작 시 isComposing을 true로 설정
  urlInput.addEventListener("compositionstart", () => {
    isComposing = true;
  });

  // 입력 종료 시 isComposing을 false로 설정
  urlInput.addEventListener("compositionend", () => {
    isComposing = false;
  });

  // ENTER 키를 눌러도 페이지 이동
  urlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !isComposing) {
      event.preventDefault();
      goButton.click();
    }
  });

  // CLOSE 버튼 클릭 시 MINISCREEN 종료
  closeButton.addEventListener("click", () => {
    miniScreen.remove();
  });


  document.body.appendChild(miniScreen);
}

init();
