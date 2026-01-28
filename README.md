# 2-hong-community-fe
AWS AI School 2기 홍석현 프론트엔드 과제

## 🛠 기술 스택 (Tech Stack)
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Frameworks/Libraries**: 없음 (Vanilla JS 구현)
- **Tools**: VS Code, Git

## 주요 기능

### 1. 회원 (User)
- **로그인 (Login)**: 이메일 유효성 검사 및 로그인 처리.
- **회원가입 (Signup)**: 프로필 이미지 업로드, 이메일/비밀번호/닉네임 유효성 검사.
- **회원정보 수정**: 닉네임, 프로필 이미지 변경.
- **비밀번호 수정**: 기존 비밀번호 확인 및 새 비밀번호 변경.
- **드롭다운 메뉴**: 헤더의 프로필 아이콘 클릭 시 회원 메뉴 노출.

### 2. 게시판 (Board)
- **게시글 목록 (Post List)**:
    - 무한 스크롤 (Infinite Scroll) 구현.
    - 게시글 제목, 작성자, 좋아요/댓글/조회수, 작성일 표기.
    - 조회수 단위 포맷팅 (예: 1k, 10k).
- **게시글 상세 (Post Detail)**:
    - 게시글 본문 조회.
    - 좋아요 기능 (Toggle).
    - 댓글 목록 조회 및 작성/수정/삭제.
    - 게시글 수정 및 삭제 (작성자 본인인 경우).
- **게시글 작성 (Create Post)**:
    - 제목(26자 제한), 내용, 이미지 업로드.
    - 유효성 검사 (빈 값 방지).
- **게시글 수정 (Edit Post)**:
    - 기존 내용 불러오기 및 수정.

### 3. 공통 (Common)
- **UI/UX**:
    - 반응형 헤더 (뒤로가기 버튼, 프로필 드롭다운).
    - 삭제 확인 모달 (Modal) 구현.
    - `alert`을 활용한 사용자 피드백.
    - `reset.css`를 통한 브라우저 기본 스타일 초기화.

## 폴더 구조

```
2-hong-community-fe/
├── assets/             # 이미지 등 정적 리소스
├── css/                # 스타일시트
│   ├── reset.css       # 초기화 CSS
│   ├── common.css      # 공통 스타일 (헤더, 버튼, 모달 등)
│   ├── auth.css        # 로그인/회원가입 관련 스타일
│   ├── board.css       # 게시판 관련 스타일
│   └── user.css        # 회원정보 수정 관련 스타일
├── js/                 # 자바스크립트 로직
│   ├── common.js       # 공통 로직 (헤더, 드롭다운 등)
│   ├── auth.js         # 인증 관련 로직
│   ├── board.js        # 게시판 CRUD 및 더미 데이터 로직
│   └── user.js         # 회원정보 관리 로직
├── pages/              # HTML 페이지
│   ├── auth/           # 로그인, 회원가입
│   ├── board/          # 게시글 목록, 상세, 작성, 수정
│   └── user/           # 비밀번호 변경, 프로필 수정
├── SiteSpecInfo/       # 기획서 및 요구사항 명세 (이미지, MD)
├── index.html          # 진입점 (Redirect)
└── README.md           # 프로젝트 설명
```