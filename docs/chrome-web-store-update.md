# Chrome Web Store Description Copy

MINISCREEN `v1.2` 재배포 시 바로 붙여 넣을 수 있도록 전체 기능 소개 문구와 업데이트 노트를 영문/국문으로 정리한 문서입니다.

## English

### Short Store Summary

MINISCREEN adds a floating mini browser on top of the current page, so you can check mobile layouts, compare references, and browse without leaving your main tab.

### Full Store Description

MINISCREEN is a Chrome extension that opens a floating mini browser on top of the page you are already viewing. It helps you stay on your main tab while checking mobile layouts, browsing references, comparing pages, or keeping a secondary site open in a compact overlay.

You can open websites inside the mini screen, switch between mobile and desktop view, move and resize the overlay freely, and save frequently used pages as bookmarks. The address bar accepts both URLs and search terms, so it is easy to jump between pages without interrupting your main workflow.

The extension is designed for quick side-by-side browsing on top of any current page, with simple controls for navigation, home, bookmarks, fullscreen, and audio mute inside the mini screen.

Key features:

- Floating iframe-based mini browser overlay
- Mobile and desktop view switching
- Smart address bar that detects URLs and search terms
- Home button, back navigation, bookmarks, and bookmark editing
- Drag, resize, and fullscreen support
- Audio mute control for the mini screen
- Syncs title and URL changes inside the frame as smoothly as possible

### Version 1.2 Update Note

Version 1.2 adds audio mute support for the mini screen and improves mute-state syncing across page navigation and supported media players.

## 한국어

### 짧은 스토어 요약

MINISCREEN은 현재 보고 있는 페이지 위에 작은 보조 브라우저 화면을 띄워서, 메인 탭을 벗어나지 않고 모바일 화면 확인, 참고 자료 비교, 보조 탐색을 할 수 있게 도와주는 확장 프로그램입니다.

### 전체 기능 설명

MINISCREEN은 현재 보고 있는 웹페이지 위에 작은 보조 브라우저 화면을 띄워 주는 Chrome 확장 프로그램입니다. 메인 탭을 유지한 채 모바일 화면을 확인하거나, 참고 사이트를 함께 열어 두고 비교하거나, 작업 중 필요한 페이지를 보조 화면으로 빠르게 탐색할 수 있습니다.

미니 화면 안에서는 일반 웹페이지 탐색이 가능하며, 모바일 뷰와 데스크톱 뷰를 전환할 수 있고, 드래그 이동과 크기 조절도 지원합니다. 주소 입력창은 URL과 검색어를 자동으로 구분해 이동할 수 있고, 자주 쓰는 페이지는 홈 또는 북마크로 저장해 다시 빠르게 열 수 있습니다.

또한 뒤로가기, 전체화면, 오디오 음소거 같은 기본 조작을 제공해서 현재 페이지를 벗어나지 않고도 보조 탐색 경험을 더 편하게 사용할 수 있도록 구성되어 있습니다.

주요 기능:

- `iframe` 기반 플로팅 미니 브라우저
- 모바일/데스크톱 뷰 전환
- 검색어와 URL을 구분하는 스마트 주소 입력창
- 홈 이동, 뒤로가기, 북마크 추가/수정/삭제
- 드래그 이동, 크기 조절, 전체화면 지원
- 미니 화면 오디오 음소거 지원
- 프레임 내부 URL 및 제목 변경 동기화 개선

### 버전 1.2 업데이트 노트

버전 1.2에서는 미니 화면 오디오 음소거 기능을 추가했고, 페이지 이동 및 지원되는 미디어 플레이어에서 음소거 상태가 더 안정적으로 유지되도록 개선했습니다.

## Redeploy Checklist

### English

1. Confirm `manifest.json` version is set to `1.2`.
2. Zip the extension files for upload, excluding unnecessary local artifacts if needed.
3. Upload the new package in Chrome Web Store Developer Dashboard.
4. Paste the English update note into the release notes field.
5. Review permissions and screenshots before submitting.

### 한국어

1. `manifest.json` 버전이 `1.2`로 설정되어 있는지 확인합니다.
2. 필요 없는 로컬 산출물을 제외하고 업로드용 압축 파일을 만듭니다.
3. Chrome Web Store 개발자 대시보드에서 새 패키지를 업로드합니다.
4. 출시 노트 입력란에 위 영문 또는 국문 업데이트 설명을 붙여 넣습니다.
5. 권한 안내와 스크린샷을 다시 확인한 뒤 제출합니다.
