# MINISCREEN

MINISCREEN은 현재 보고 있는 웹페이지 위에 작은 보조 브라우저 화면을 띄우는 Chrome 확장 프로그램입니다. 메인 탭을 벗어나지 않고 모바일 화면을 빠르게 확인하거나, 참고용 페이지를 옆에 띄워 두고 작업할 수 있게 설계되어 있습니다.

## 실제 사용 화면

### 모바일 뷰 + 북마크 패널

![MINISCREEN bookmark panel](./docs/images/miniscreen-bookmarks.png)

### 데스크톱 뷰

![MINISCREEN desktop view](./docs/images/miniscreen-desktop.png)

## 한눈에 보기

- 현재 탭 위에 `iframe` 기반의 미니 브라우저를 오버레이로 표시
- 기본 `mobile view`와 넓은 `desktop view` 전환 지원
- 주소 입력창에서 검색어 / URL 자동 판별
- 뒤로가기, 홈 이동, 북마크 패널, 북마크 추가/수정/삭제 지원
- 헤더 드래그 이동, 우하단 핸들 리사이즈 지원
- 북마크, 홈 URL, 뷰 모드를 `chrome.storage.sync`에 저장
- 프레임 내부 이동 추적을 통해 현재 주소와 제목을 최대한 유지

## 빠른 시작

### Chrome Web Store

1. [Chrome Web Store](https://chromewebstore.google.com/detail/hkbkhopmbecilgmfacgbihohlfhhbpin)로 이동합니다.
2. `Chrome에 추가`를 클릭합니다.

### 압축 해제된 확장 프로그램으로 설치

빌드 과정은 없습니다. 이 저장소 그대로 로드하면 됩니다.

1. 이 저장소를 다운로드하거나 클론합니다.
2. Chrome 주소창에 `chrome://extensions/` 입력 후 이동합니다.
3. 우측 상단 `개발자 모드`를 활성화합니다.
4. `압축해제된 확장 프로그램을 로드합니다`를 클릭합니다.
5. 이 프로젝트 폴더를 선택합니다.

## 주요 사용 시나리오

- 반응형 검수 중 모바일 레이아웃을 빠르게 확인할 때
- 메인 작업 페이지를 유지한 채 문서, 검색 결과, 참고 사이트를 같이 볼 때
- 쇼핑몰 / 랜딩 페이지 / 블로그를 작은 보조 화면으로 열어 비교할 때

## 기능 상세

### 1. 미니 브라우저 실행

브라우저 툴바의 MINISCREEN 아이콘을 클릭하면 현재 페이지 위에 미니 화면이 열립니다.

- 기본 홈 URL은 `https://www.google.com/`
- 저장된 홈 URL이 있으면 그 주소로 시작
- 이미 열려 있으면 중복 생성하지 않음

### 2. 주소 입력창 동작

입력창은 값에 따라 다음처럼 동작합니다.

- `.` 이 없는 입력값: 검색어로 간주하고 DuckDuckGo 검색 실행
- `.` 이 있는 입력값: 주소로 간주
- `http://`, `https://`가 없으면 자동으로 `https://` 추가
- 빈 값으로 이동 시 저장된 홈 URL로 이동

### 3. 탐색 및 홈 설정

- `<` 버튼: iframe 내부 뒤로가기
- `>` 버튼 또는 `Enter`: 입력값으로 이동
- `⌂` 버튼 클릭: 저장된 홈 URL로 이동
- `⌂` 버튼 우클릭: 현재 URL 또는 입력창 값을 홈 URL로 저장

### 4. 북마크

북마크 패널에서 현재 페이지를 빠르게 저장하고 다시 열 수 있습니다.

- `★` 버튼: 북마크 패널 열기 / 닫기
- `+` 버튼: 현재 페이지 북마크 추가
- 동일 URL 중복 저장 방지
- 최대 20개까지 유지
- 북마크 이름 수정 가능
- 북마크 삭제 가능

### 5. 뷰 모드 전환

우측 상단 `M / W` 버튼으로 뷰 모드를 전환합니다.

- `M`: 모바일 뷰
- `W`: 데스크톱 웹 뷰

모바일 뷰에서는 서브프레임 요청에 모바일 User-Agent를 적용합니다. 선택한 모드는 저장되며 다음 실행 때 복원됩니다.

### 6. 이동 및 크기 조절

- 헤더를 드래그해 위치 이동
- 우하단 리사이즈 핸들로 크기 조절
- 화면 바깥으로 벗어나지 않도록 viewport 기준으로 보정
- 브라우저 크기 변경 시 위치를 기본값으로 재정렬

## 프로젝트 구조

```text
MINISCREEN/
├── manifest.json                # 확장 프로그램 설정과 권한
├── src/
│   ├── background/
│   │   ├── index.js             # 서비스 워커 진입점, content 스크립트 주입
│   │   ├── messages.js          # runtime 메시지 처리
│   │   └── rules.js             # 뷰 모드별 동적 네트워크 규칙
│   ├── content/
│   │   ├── app.js               # 오버레이 초기화와 이벤트 연결
│   │   ├── bookmarks.js         # 북마크 상태와 렌더링
│   │   ├── constants.js         # content 레이어 상수
│   │   ├── dom.js               # 오버레이 템플릿과 DOM 참조 수집
│   │   ├── layout.js            # 드래그, 리사이즈, viewport 보정
│   │   ├── runtime.js           # background 메시지 호출 래퍼
│   │   ├── storage.js           # chrome.storage 접근 래퍼
│   │   ├── styles.css           # 오버레이 UI 스타일
│   │   └── utils.js             # URL 정규화와 제목 유틸
│   └── frame-tracker/
│       └── index.js             # iframe 내부 주소 변경 추적 및 링크 이동 보정
├── docs/
│   └── images/
└── icon*.png                    # 확장 프로그램 아이콘
```

## 동작 방식

### src/background

- `index.js`: 확장 아이콘 클릭 시 content 레이어 파일들을 순서대로 현재 탭에 주입
- `messages.js`: content에서 보낸 runtime 메시지 처리
- `rules.js`: `declarativeNetRequest` 동적 규칙 생성과 적용 담당
- 모바일 뷰일 때 서브프레임 요청에 모바일 User-Agent 적용
- 뷰 모드 변경 메시지를 받아 저장하고 규칙 갱신

### src/content

- `app.js`: 전체 초기화, storage 연동, 이벤트 바인딩
- `dom.js`: `#miniscreen` 오버레이 템플릿과 DOM 조회
- `bookmarks.js`: 북마크 목록 렌더링, 추가/수정/삭제
- `layout.js`: 드래그 이동, 리사이즈, viewport 보정
- `runtime.js`: background runtime 메시지 호출 캡슐화
- `storage.js`: 홈 URL, 북마크, 뷰 모드 저장소 접근 캡슐화
- `constants.js`, `utils.js`: 공통 상수와 URL/제목 유틸

### src/frame-tracker

- iframe 안에서 실행되는 보조 스크립트
- `load`, `pageshow`, `hashchange`, `history.pushState`, `history.replaceState`를 감지
- 현재 프레임 URL과 title을 상위 창에 `postMessage`로 전달
- `_blank`, `_top`, `_parent` 링크를 가능한 한 iframe 내부 탐색으로 전환

## 권한과 그 이유

`manifest.json`에는 아래 권한이 포함되어 있습니다.

- `scripting`: 현재 탭에 `src/content/*` 스크립트를 주입하기 위해 사용
- `storage`: 홈 URL, 북마크, 뷰 모드를 저장하기 위해 사용
- `declarativeNetRequest`: 프레임 차단 헤더 제거 및 User-Agent 변경에 사용
- `host_permissions: <all_urls>`: 다양한 사이트를 미니 화면에서 열기 위해 필요

## 제약 사항

이 확장 프로그램은 편의성보다 "가능한 한 많은 사이트를 미니 프레임으로 열기"에 초점을 둡니다. 그 때문에 다음 제약이 있습니다.

- 일부 사이트는 여전히 iframe 로딩을 차단할 수 있습니다.
- `Content-Security-Policy`, `X-Frame-Options` 제거가 항상 성공을 보장하지는 않습니다.
- 사이트별 스크립트 정책, 로그인 정책, 쿠키 정책에 따라 동작이 달라질 수 있습니다.
- 모바일 User-Agent 강제 적용은 일부 사이트에서 예기치 않은 UI 차이를 만들 수 있습니다.
- Chrome 확장 프로그램 정책 또는 브라우저 보안 정책 변경에 영향을 받을 수 있습니다.

## 개발 메모

- 별도 번들러나 패키지 매니저를 사용하지 않는 순수 JavaScript 기반 구조입니다.
- 소스 수정 후 `chrome://extensions/`에서 새로고침하면 변경 사항을 확인할 수 있습니다.
- 현재 저장소에는 테스트, 린트, 빌드 스크립트가 포함되어 있지 않습니다.

## 개선 아이디어

- 홈 URL 설정 UI 추가
- 북마크 정렬 / 폴더 / 검색 지원
- 위치와 크기 상태 영속화
- 사이트별 뷰 모드 기억
- 키보드 단축키 및 접근성 개선

## 라이선스

저장소에 별도 라이선스 파일이 없다면 기본적으로 명시적 사용 허가가 없는 상태입니다. 공개 배포 목적이라면 `LICENSE` 파일을 추가하는 것을 권장합니다.
