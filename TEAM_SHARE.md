# 시간여행 제주 — 프론트엔드 팀 공유 문서

`2026-tourcontest-wonderbuddies/Frontend` 레포에 처음 프론트엔드 초안을 올리며 팀원(특히 백엔드 개발자)에게
현재 상태를 공유하기 위한 문서입니다.

## 1. 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다.

- 기본값(`VITE_USE_MOCKS=true`)으로 실행하면 [MSW](https://mswjs.io)가 `/api/*` 요청을 가로채 목업 데이터를
  돌려주므로, **백엔드 서버 없이도 아래 모든 화면이 즉시 동작**합니다.
- 타입체크 + 프로덕션 빌드 확인: `npm run build`
- 린트: `npm run lint`

## 2. 주요 폴더 구조 및 역할

```
src/
  api/                  API 클라이언트, 타입, 도메인별 fetch 함수
    client.ts           공통 fetch 래퍼 (인증 헤더 부착, 에러 처리)
    auth.ts / trips.ts / candidates.ts / saved.ts / edit.ts / chat.ts / search.ts
                         도메인별 API 함수 (실제 fetch와 MSW 목업 모두 이 함수를 통해 호출됨)
    types.ts             프론트-백엔드 공유 타입 정의 (API_CONTRACT.md 기준)
    mocks/               MSW 목업 서버
      handlers.ts        도메인별 handler를 모아 등록
      handlers/          auth, trips, candidates, saved, edit, chat, search — 도메인별 핸들러 분리
      data.ts / auth-data.ts / lodging-data.ts   목업 시드 데이터
      persist.ts         브라우저 세션 내 목업 상태 저장(생성한 코스 등 새로고침해도 유지)
      recompute.ts        일정 수정(day override, 장소 교체) 시 목업 서버에서 일정 재계산
      browser.ts          MSW worker 초기화

  auth/                 인증 상태 관리
    AuthContext.tsx      로그인 세션(localStorage 저장), 로그인/회원가입/로그아웃 로직
    ProtectedRoute.tsx   비로그인 시 /login으로 리다이렉트하는 라우트 가드

  components/           Nav, TabBar, Footer, CourseCard, ChipGroup, TimeDial,
                         DayOverrideSheet, PlaceDetailSheet, PlaceQuickPicker 등 공용 컴포넌트

  hooks/                react-query 기반 데이터 훅 (useCreateTrip, useTrip, useCandidates,
                         useSaved, useSearch, useChat, useEdit 등) — 페이지는 이 훅을 통해서만 api/를 호출

  pages/                화면 13개 (아래 3번 표 참고)

  styles/global.css     기존 정적 프로토타입(siganyeohaeng-jeju.html)의 디자인 시스템을 그대로 이식
  utils/format.ts       날짜/시간 포맷 유틸
```

**핵심 포인트**: 페이지는 절대 `fetch`를 직접 호출하지 않고, `hooks/` → `api/`(도메인 함수) → `api/client.ts`
순서로 내려갑니다. 그래서 실제 백엔드로 전환할 때 `api/*.ts` 아래 함수 구현만 그대로 두고(시그니처 동일),
`.env.local`에서 `VITE_API_BASE_URL` + `VITE_USE_MOCKS=false`만 바꾸면 페이지/훅 코드는 손댈 필요가 없습니다.

## 3. 라우팅(화면) 상태

| 경로 | 화면 | 상태 |
|---|---|---|
| `/` | 홈 (시간대 다이얼, 추천 코스 큐레이션) | ✅ 완성 (목업 기준) |
| `/builder` | 코스 만들기 (`TripRequest` 전체 입력 폼) | ✅ 완성 (목업 기준) |
| `/trips/candidates/:requestId` | 생성된 후보 코스 선택 | ✅ 완성 (목업 기준) |
| `/trip/:id` | 코스 상세 (타임라인) | ✅ 완성 (목업 기준) |
| `/trip/:id/edit` | 코스 수정 (장소 교체, 일정 재계산) | ✅ 완성 (목업 기준) |
| `/trip/:id/chat` | 코스 관련 채팅 | ✅ 완성 (목업 기준) |
| `/trip/:id/map` | 코스 지도 보기 | 🟡 화면은 완성, **카카오맵 실연동은 준비 중** (지금은 방문 순서만 텍스트로 확인 가능) |
| `/search` | 장소 검색 | ✅ 완성 (목업 기준) |
| `/saved`, `/saved/map` | 저장한 코스 (로그인 필요) | ✅ 완성 (목업 기준) |
| `/login`, `/signup` | 로그인/회원가입 | 🟡 이메일 로그인/가입은 완성, **소셜 로그인·가입은 준비 중** |
| `/list` | 추천 코스 전체 목록 | ⚪ **정적 목업 — 의도적으로 실 API 미연동.** 백엔드에 "공개 코스" 모델(`TripRequest`와 독립된 코스 목록)이 아직 없어 이번 범위에서 제외함. 자세한 내용은 `API_CONTRACT.md` 참고 |

그 외 개별 컴포넌트 단위로 준비 중인 것: `PlaceDetailSheet`의 실제 제휴사 예약 연동(현재는 안내 메시지만 표시).

## 4. 백엔드 팀에게 전달하는 메시지

- 백엔드 API가 아직 없는 상태(모든 `views.py`가 빈 스텁)라서, 프론트가 기대하는 REST 계약을 먼저
  [`API_CONTRACT.md`](./API_CONTRACT.md)로 정의했고, **MSW로 이 계약 전체(`/api/trips/`, `/api/trips/:id/`
  등)를 가짜 서버로 세팅 완료**했습니다. 덕분에 백엔드 없이도 홈 → 빌더 → 후보 선택 → 상세/수정/채팅 →
  저장까지 전체 플로우가 프론트 단독으로 동작합니다.
- 실제 서버가 준비되면 프론트는 `.env.local`에 `VITE_API_BASE_URL` 지정 + `VITE_USE_MOCKS=false`만
  변경하면 되도록 미리 구조를 잡아뒀습니다(코드 수정 불필요).
- `API_CONTRACT.md`는 프론트 관점에서 먼저 제안한 초안입니다. 백엔드 모델/구현상 계약과 다르게 갈 수밖에
  없는 부분이 있다면 알려주세요 — 그에 맞춰 프론트를 조정하겠습니다.
- 앞으로 실제 API 연동 작업(계약 변경, 목업→실 서버 전환 등)을 진행할 때는 코드를 먼저 수정하지 않고,
  작업 계획을 팀에 먼저 공유하고 합의된 뒤에 진행할 예정입니다.
