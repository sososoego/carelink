# CareLink — 간병인 매칭 플랫폼

> 환자 가족과 간병인을 빠르고 신뢰할 수 있게 연결합니다.

---

## 문제 인식

국내 간병 시장은 연간 수조 원 규모이지만, 여전히 **소개소 의존**과 **불투명한 정보**로 인해 이용자가 어려움을 겪고 있습니다.

| 기존 방식의 문제 | 내용 |
|---|---|
| 정보 비대칭 | 간병인의 경력·자격·시급을 사전에 알기 어려움 |
| 높은 중개 수수료 | 소개소 마진으로 실질 비용 증가 |
| 느린 매칭 | 전화·방문 중심의 오프라인 절차 |
| 신뢰 부족 | 사후 평가·이력 확인 시스템 미비 |

---

## 서비스 소개

**CareLink**는 간병인이 직접 프로필을 등록하고, 환자 가족이 조건에 맞는 간병인을 검색하거나 자동으로 추천받아 매칭 요청을 보낼 수 있는 모바일 플랫폼입니다.

```
환자 가족  ──────────────────────────────────  간병인
  │                                              │
  ├─ 조건 검색 (지역 / 시급 / 경력)              ├─ 프로필 등록
  ├─ AI 자동 추천 (날짜·지역 기반)               ├─ 매칭 요청 수신
  └─ 매칭 요청 → 수락 대기                       └─ 수락 / 거절
```

---

## 핵심 기능

### 간병인
- **프로필 등록** — 생년월일, 성별, 담당 가능 지역, 경력, 보유 자격증, 시급, 자기소개
- **매칭 요청 관리** — 요청 수신 후 수락 / 거절 처리

### 환자 가족
- **간병인 검색** — 지역 · 최소 경력 · 최대 시급 필터링 후 즉시 조회
- **자동 추천** — 간병 기간 + 지역 + 시급 조건 입력 시 최대 5명 추천 (기간 중 이미 매칭된 간병인 자동 제외)
- **매칭 요청** — 원하는 간병인에게 기간을 지정하여 요청 전송
- **매칭 현황** — 요청한 매칭의 수락 / 거절 / 대기 상태 실시간 확인

---

## 화면 구성

| 화면 | 설명 |
|---|---|
| 로그인 / 회원가입 | 역할(가족 / 간병인) 선택 후 가입 |
| 간병인 프로필 등록 | 신규 간병인 가입 시 자동 진입, 이후 수정 가능 |
| 간병인 검색 | 필터 + 목록 조회, 카드에서 바로 매칭 요청 |
| 추천받기 | 조건 입력 → 상위 5명 추천 결과 표시 |
| 매칭 현황 (가족) | 내가 보낸 요청 목록 및 상태 확인 |
| 매칭 요청함 (간병인) | 받은 요청 목록, 수락 / 거절 버튼 |

---

## 기술 스택

| 영역 | 기술 |
|---|---|
| 모바일 앱 | React Native (Expo) + TypeScript |
| 상태 관리 | Zustand + AsyncStorage (로그인 유지) |
| 백엔드 | Node.js + Express 5 |
| 데이터베이스 | PostgreSQL |
| 인증 | JWT (Access Token) |
| 네비게이션 | React Navigation v6 |

---

## 데이터 모델 (핵심)

```
users
  id · name · email · password · role(family|caregiver)

caregiver_profiles
  user_id · gender · birth_date · experience · certifications[]
  regions[] · available_days[] · hourly_rate · bio · rating

match_requests
  family_id · caregiver_id · status(pending|accepted|rejected)
  start_date · end_date
```

---

## API 구조

| Method | Endpoint | 설명 |
|---|---|---|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| GET | `/api/caregivers` | 간병인 목록 (필터) |
| GET | `/api/caregivers/recommend` | 조건 기반 자동 추천 |
| POST/PUT | `/api/caregivers/profile` | 간병인 프로필 등록/수정 |
| POST | `/api/matches` | 매칭 요청 생성 |
| GET | `/api/matches` | 내 매칭 목록 조회 |
| PUT | `/api/matches/:id` | 수락 / 거절 (간병인) |

---

## 향후 확장 계획

| 단계 | 기능 |
|---|---|
| 2차 | 결제 연동 (토스페이먼츠), 스케줄 캘린더 |
| 3차 | 매칭 완료 후 상호 리뷰 · 평점 |
| 4차 | 매칭 전 채팅, 관리자 대시보드 |

---

## GitHub

[https://github.com/sososoego/carelink](https://github.com/sososoego/carelink)
