# CareLink

환자 가족과 간병인을 연결하는 모바일 매칭 플랫폼

## 주요 기능

**간병인**
- 프로필 등록 (경력, 자격증, 지역, 시급 등)
- 매칭 요청 수락 / 거절

**환자 가족**
- 간병인 검색 (지역, 경력, 시급 필터)
- 조건 기반 자동 추천 (최대 5명)
- 매칭 요청 전송 및 현황 확인

## 기술 스택

| 영역 | 기술 |
|------|------|
| Mobile | React Native (Expo) + TypeScript |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL |
| 인증 | JWT |
| 상태 관리 | Zustand |
| 네비게이션 | React Navigation v6 |

## 프로젝트 구조

```
carelink/
├── mobile/        # React Native 앱
│   └── src/
│       ├── screens/
│       │   ├── auth/        # 로그인, 회원가입
│       │   ├── family/      # 가족 화면
│       │   └── caregiver/   # 간병인 화면
│       ├── api/             # API 클라이언트
│       ├── navigation/      # 네비게이션
│       ├── store/           # Zustand 상태
│       └── types/           # TypeScript 타입
└── server/        # Express 백엔드
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
```

## 시작하기

### 사전 요구사항
- Node.js 18+
- PostgreSQL
- Expo CLI

### 서버 실행

```bash
cd server
cp .env.example .env   # 환경변수 설정
npm install
node app.js
```

### 모바일 앱 실행

```bash
cd mobile
npm install
npx expo start
```

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| GET | /api/caregivers | 간병인 목록 (필터) |
| GET | /api/caregivers/recommend | 조건 기반 추천 |
| PUT | /api/caregivers/profile | 간병인 프로필 등록/수정 |
| POST | /api/matches | 매칭 요청 생성 |
| GET | /api/matches | 매칭 목록 조회 |
| PUT | /api/matches/:id | 매칭 수락/거절 |
