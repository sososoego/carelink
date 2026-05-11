# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**CareLink** — 환자 가족과 간병인을 연결하는 모바일 매칭 플랫폼

- 간병인이 앱에 프로필을 직접 등록
- 환자 가족은 직접 선택 또는 조건 입력 시 자동 추천
- 1차 목표: 매칭 기능 | 2차 확장: 결제, 스케줄 관리

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Mobile | React Native (Expo) |
| 언어 | TypeScript |
| Backend | Node.js + Express 5 |
| 데이터베이스 | PostgreSQL |
| 인증 | JWT |
| 상태 관리 | Zustand |
| 네비게이션 | React Navigation v6 |

---

## 개발 환경 및 명령어

### Mobile (`mobile/`)
```bash
npx expo start          # 개발 서버 시작
npx expo start --ios    # iOS 시뮬레이터
npx expo start --android # Android 에뮬레이터
npm run typecheck       # TypeScript 타입 체크
npm test                # 테스트 실행
```

### Backend (`server/`)
```bash
node app.js             # 서버 실행 (http://localhost:3000)
npx nodemon app.js      # 자동 재시작 모드
npm test                # 테스트 실행
```

---

## 디렉토리 구조

```
carelink/
├── mobile/                      # React Native (Expo) 앱
│   └── src/
│       ├── screens/             # 화면 컴포넌트
│       │   ├── auth/            # 로그인, 회원가입
│       │   ├── family/          # 환자 가족용 화면
│       │   └── caregiver/       # 간병인용 화면
│       ├── components/          # 재사용 UI 컴포넌트
│       ├── navigation/          # React Navigation 설정
│       ├── hooks/               # 커스텀 훅
│       ├── store/               # Zustand 전역 상태
│       ├── api/                 # 백엔드 API 호출 함수
│       └── types/               # TypeScript 타입 정의
└── server/                      # Node.js + Express 백엔드
    ├── app.js                   # Express 앱 진입점
    ├── routes/
    │   ├── auth.js              # 회원가입, 로그인
    │   ├── caregivers.js        # 간병인 프로필 CRUD
    │   └── matches.js           # 매칭 요청/수락/거절
    ├── controllers/
    ├── middleware/
    │   └── auth.js              # JWT 검증 미들웨어
    └── models/                  # DB 모델 (추후 ORM 적용)
```

---

## 핵심 기능 및 사용자 흐름

### 간병인
1. 회원가입 → 프로필 등록 (경력, 자격증, 가능 지역, 시간대)
2. 매칭 요청 수신 → 수락/거절

### 환자 가족
1. 회원가입 → 환자 정보 입력
2. **직접 선택**: 간병인 목록 탐색 → 프로필 확인 → 매칭 요청
3. **자동 추천**: 조건 입력 (지역, 날짜, 필요 서비스) → 추천 목록 수신

### 매칭 API 구조
```
POST /api/matches          # 매칭 요청 생성
GET  /api/matches/:id      # 매칭 상태 조회
PUT  /api/matches/:id      # 수락/거절 (간병인)
GET  /api/caregivers       # 간병인 목록 (필터링)
GET  /api/caregivers/recommend  # 조건 기반 추천
```

---

## 코딩 컨벤션

### TypeScript (Mobile)
- 컴포넌트: **PascalCase** (`CaregiverCard.tsx`)
- 훅: `use` 접두사 (`useCaregiverSearch.ts`)
- 타입: `src/types/` 중앙 관리, 인터페이스 `I` 접두사 금지
- 화면 컴포넌트는 `screens/`, 재사용 컴포넌트는 `components/`

### JavaScript (Backend)
- 파일명: **camelCase** (`caregiverController.js`)
- 라우트는 `express.Router()` 단위로 분리
- async 핸들러 `try/catch` 생략 가능 (Express 5 자동 전파)

### 공통
- 들여쓰기: 2 spaces
- 문자열: single quote (`'`)
- 커밋 전 `typecheck` 통과 필수

---

## 사용자 역할

| 역할 | 설명 |
|------|------|
| `family` | 환자 가족 — 간병인 검색 및 매칭 요청 |
| `caregiver` | 간병인 — 프로필 등록, 매칭 수락/거절 |
| `admin` | 관리자 — 사용자 관리, 분쟁 처리 (추후) |

JWT payload에 `role` 필드 포함 → 미들웨어에서 권한 분기

---

## 향후 확장 계획 (2차)

- **결제**: PG사 연동 (토스페이먼츠 권장)
- **스케줄 관리**: 캘린더 기반 근무 일정 조율
- **리뷰/평점**: 매칭 완료 후 상호 평가
- **채팅**: 매칭 전 간단한 메시지 기능
