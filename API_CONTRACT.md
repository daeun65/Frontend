# 시간여행 제주 — 프론트-백엔드 API 계약 (제안, v0.1)

이 문서는 프론트엔드(`web/`)가 기대하는 API 형태를 먼저 정의한 것입니다. 백엔드 레포(`Backend`)에는
아직 `views.py`/`urls.py`가 비어 있어 실제 엔드포인트가 없으므로, 프론트는 우선 이 계약대로
MSW(Mock Service Worker)를 붙여 개발하고 있습니다. **백엔드 구현 시 이 문서를 기준으로 맞춰주시거나,
불가능한 부분은 알려주시면 프론트를 조정하겠습니다.**

기준이 된 백엔드 모델: `apps/trips/models.py`(`TripRequest`, `ItineraryDay`, `ItineraryItem`),
`apps/places/models.py`(`Place`).

---

## 1. `POST /api/trips/` — 코스 생성 (Builder 제출)

Builder 화면에서 사용자가 입력한 조건을 그대로 `TripRequest`에 대응시켜 전송합니다.
백엔드는 `course_builder.py`의 빔서치+매크로 평가를 실행해 완성된 일정을 바로 응답으로 돌려줍니다
(비동기 큐 없이 동기 처리 가정 — 만약 처리 시간이 길어 비동기가 필요하면 `202 Accepted` +
polling용 `GET /api/trips/{id}/status/` 형태로 바뀔 수 있음을 백엔드와 협의 필요).

### Request Body

```ts
interface TripRequestPayload {
  // --- 1차 필수 입력 (Hard Constraints) ---
  start_datetime: string;          // ISO 8601, 여행 시작(제주 도착) 일시
  end_datetime: string;            // ISO 8601, 여행 종료(제주 출발) 일시
  departure_place_id?: string;     // 출발지(공항 등) content_id. 비워도 됨
  arrival_place_id?: string;       // 최종 도착지. return_to_departure가 true면 출발지와 동일하게 처리
  return_to_departure: boolean;

  transport_mode: "rental_car" | "own_car" | "taxi";
  companion_type: "alone" | "couple" | "friend" | "family_kids" | "parents" | "group";
  purpose_main: PurposeKey;
  purpose_sub?: PurposeKey;
  course_priority: "dist" | "pref" | "relax";
  region_preference?: RegionKey;   // 단일 선택 (모델이 단일 CharField)
  day_overrides?: DayOverridePayload[]; // 다일 여행에서 특정 날짜만 목적/우선순위/권역/숙소도착시각을 다르게 설정

  // --- 2차 선택 입력 (Soft Constraints) ---
  mood_tags?: string[];            // 최대 3개
  include_places?: string[];       // 이상적으로는 content_id 배열. 장소검색 API가 아직 없어
                                    // 프론트는 현재 자유 텍스트(장소명)를 그대로 보냄 — 알려진 한계, 4번 참고
  exclude_places?: string[];       // 위와 동일
  exclude_categories?: string[];   // 예: ["박물관", "액티비티"]
  walk_light?: boolean;
  indoor_outdoor_pref?: "상관없음" | "실내중심" | "야외중심" | "적절히섞기";

  // --- 3차 자유 텍스트 ---
  free_text_input?: string;

  // --- 음식 ---
  food_pref_1?: FoodPrefKey;
  food_pref_2?: FoodPrefKey;
  food_restriction?: "없음" | "비건" | "육류제외" | "해산물제외" | "알레르기·기타";
  food_cafe_balance?: "음식점중심" | "카페중심" | "둘다";  // purpose_main/sub가 'food'일 때만 유효

  // --- 숙박 (다일 여행에서만) ---
  lodging_capacity?: number;
  lodging_type?: "호텔" | "리조트·콘도" | "펜션·민박" | "게스트하우스" | "상관없음";
  lodging_conditions?: string[];   // 예: ["주차가능", "취사가능"]
  lodging_budget?: number;         // 1박 예산, 참고용
  lodging_free_text?: string;
}

type PurposeKey = "nature" | "food" | "photo" | "culture" | "activity" | "shopping";
type RegionKey =
  | "제주시동부" | "제주시서부" | "제주시내"
  | "서귀포동부" | "서귀포서부" | "전역";
type FoodPrefKey =
  | "제주향토음식" | "고기구이" | "해산물요리" | "회물회초밥" | "한식"
  | "면요리" | "분식간편식" | "일식" | "중식" | "양식세계음식";

interface DayOverridePayload {
  day_index: number;               // 1부터
  purpose_main?: PurposeKey;
  course_priority?: "dist" | "pref" | "relax";
  region_preference?: RegionKey;
  lodging_arrival_time?: string;   // "HH:MM", 기본값 15:00. 마지막 날은 설정하지 않음
}
```

### Response Body — `TripResponse` (200)

```ts
interface TripResponse {
  id: string;
  created_at: string;
  request: TripRequestPayload;      // 제출한 조건 echo (재확인/공유용)
  total_days: number;
  days: ItineraryDayDTO[];
}

interface ItineraryDayDTO {
  day_index: number;                 // 1부터
  day_case: "A" | "B" | "C" | "D";   // 입도일/중간일차/출도일/당일치기
  avail_hours: number;
  target_slots: number;
  need_lunch: boolean;
  need_dinner: boolean;
  need_night_spot: boolean;
  lodging?: PlaceDTO | null;         // 그 날 숙박 (Lodging, 코스 완성 후 매칭)
  items: ItineraryItemDTO[];
}

interface ItineraryItemDTO {
  order: number;                     // 0부터
  slot_type: "GENERAL" | "RESTAURANT" | "CAFE" | "SNACK";
  place: PlaceDTO;
  arrive_at: string;                 // ISO 8601
  depart_at: string;                 // ISO 8601
  stay_min: number;
  travel_min_from_prev?: number | null;
  hours_uncertain?: boolean;         // 영업시간 확인불가 표시
  pref_score?: number | null;        // 감사(audit)용, 화면엔 옵션 표시
  adjusted_qual?: number | null;
}

interface PlaceDTO {
  content_id: string;
  title: string;
  address: string;
  longitude: number;
  latitude: number;
  overview?: string;
  content_type_name: string;         // 관광지/문화시설/쇼핑/음식점
  small_category_name?: string;
  quadrant: "NE" | "NW" | "SE" | "SW";
  satisfaction_score?: number | null;
}
```

### 에러

- `400` — 유효성 오류. `{ "field_errors": { "start_datetime": ["필수 값입니다"] } }` 형태 제안
- `422`/`200 with empty days` — 조건에 맞는 코스를 만들 수 없는 경우 처리 방식은 백엔드와 협의 필요
  (현재 프론트는 `days`가 비어 있으면 "조건을 완화해보세요" 안내를 표시하도록 구현)

---

## 2. `GET /api/trips/{id}/` — 코스 상세 조회

Detail 화면 진입/새로고침/공유링크용. 응답은 `TripResponse`와 동일.

- `404` — 존재하지 않는 id

---

## 3. 인증 (전체 신규 — 백엔드에 accounts 앱 자체가 없음)

기획 명세서(`TripJeju_기능명세서`) 1번 "계정 기반 여행 계획 동기화" 반영. 지금은 프론트가 MSW로만
흉내내고 있고, 백엔드에는 `django.contrib.auth`도 아직 붙어있지 않다. 정식 구현 시 JWT 또는
세션 기반으로 바꾸면 되고, 아래는 프론트가 기대하는 최소 형태다.

| 엔드포인트 | 설명 |
|---|---|
| `POST /api/auth/signup` | body: `{ email, password, name }` → `{ user, token }` (201) |
| `POST /api/auth/login` | body: `{ email, password }` → `{ user, token }` (200) / 실패 시 `401 { detail }` |
| `POST /api/auth/logout` | 204 |
| `GET /api/auth/me` | `Authorization: Bearer {token}` 필요 → `User` |

```ts
interface User { id: string; email: string; name: string; }
```

로그인/회원가입 자체는 비로그인 사용자도 접근 가능하지만, **코스 추천 생성 요청(`POST /api/trips/candidates/`), 코스 저장, 코스 수정은 로그인 필요** (명세서 2.1, 11.1 권한 규칙).

---

## 4. 코스 추천 후보 (기존 `POST /api/trips/`를 2단계로 분리)

명세서 7.2.1 "추천 코스 목록 선택"에 맞춰, 코스 생성은 이제 **후보 3개 제안 → 사용자가 1개 선택**
흐름으로 바뀐다. 기존 `POST /api/trips/`(1번 섹션)는 이 흐름이 필요 없는 단순 케이스를 위해 유지해도 되고,
아래로 완전히 대체해도 된다 — 백엔드 팀과 협의 필요.

| 엔드포인트 | 설명 |
|---|---|
| `POST /api/trips/candidates/` | body = `TripRequestPayload` (1번 섹션과 동일) → `CandidatesResponse` (동선효율/취향중심/여유로운 3개 후보, 아직 저장되지 않음) |
| `POST /api/trips/candidates/{candidateId}/select/` | 후보 하나를 확정 → 실제 `TripResponse` 발급(id 생성, 이후 `GET /api/trips/{id}/`로 조회 가능) |

```ts
interface CandidatesResponse {
  request_id: string;
  candidates: TripCandidateDTO[];
}

interface TripCandidateDTO {
  id: string;
  mode: "dist" | "pref" | "relax";
  label: string;                     // "동선 효율 추천" 등
  visit_count: number;
  total_duration_min: number;
  total_distance_km: number;
  slack_min: number;
  scores: { move_eff: number; pref_fit: number; slack: number }; // 1~5, 별점 표시용
  description: string;
  badges: string[];                  // "운영정보 확인필요 1건" 등
  days: ItineraryDayDTO[];           // 선택 전 미리보기용, 1번 섹션의 ItineraryDayDTO와 동일 구조
}
```

후보가 0개면 `200 { request_id, candidates: [] }`로 응답하고, 프론트는 "코스를 찾지 못했어요" 안내와
조건 완화 도움말을 보여준다(명세서 7.2 예외 처리).

---

## 5. 코스 수정 (직접 편집 + 재계산)

명세서 9.1. 변경 지점 이후 일정만 재계산하는 것이 핵심 규칙이다.

`POST /api/trips/{id}/edit/`

```ts
interface EditRequestPayload {
  day_index: number;
  op: "reorder" | "swap" | "remove" | "add" | "lock" | "stay_time";
  item_order?: number;      // 대상 아이템의 현재 order
  direction?: "up" | "down"; // op="reorder"
  new_place_id?: string;     // op="swap" | "add"
  stay_min?: number;         // op="stay_time"
}

interface EditResponse {
  trip: TripResponse;                  // 재계산된 전체 코스
  violations: ConstraintViolationDTO[]; // 운영시간 초과 등, 있으면 프론트가 안내 시트를 띄움
}

interface ConstraintViolationDTO {
  type: "hours_exceeded" | "schedule_overrun" | "travel_time_insufficient";
  place_title?: string;
  detail: string;
}
```

프론트의 되돌리기/다시 실행(명세서 9.1.2)은 서버 없이 클라이언트가 이전 응답들을 메모리에 쌓아뒀다가
전환하는 방식으로 구현한다 — 별도 API 불필요.

---

## 6. 챗봇 코스 수정

명세서 9.2. **챗봇은 장소 선정·시간 계산을 직접 하지 않고, 의도만 구조화해서 추천엔진(5번 섹션과 같은 재계산 로직)에 넘긴다.**

`POST /api/trips/{id}/chat/`

```ts
interface ChatRequestPayload {
  message?: string;      // 자유 문장
  quick_fix?: "lock_place" | "swap_place" | "add_place" | "exclude_category"
            | "indoor_focus" | "outdoor_focus" | "walk_light" | "add_slack";
}

interface ChatResponse {
  messages: ChatMessageDTO[];   // 이번 요청으로 추가된 대화 메시지(사용자+챗봇 응답)
  trip: TripResponse | null;    // 재계산 성공 시 갱신된 코스, 실패 시 null
  violations: ConstraintViolationDTO[];
}

interface ChatMessageDTO {
  id: string;
  role: "user" | "assistant";
  text: string;
  created_at: string;
  structured_intent?: { type: string; summary: string }; // 챗봇이 해석한 구조화된 의도
}
```

지금 프론트 목업은 실제 LLM 없이 **키워드 매칭**으로 의도를 흉내낸다. 실제 LLM 연동 시 이 응답 형태만
맞춰주면 프론트 변경은 최소화된다.

---

## 7. 숙소 추천

명세서 5번. `GET /api/lodging/recommendations?tripId={id}` → Top-3.

```ts
interface LodgingDTO {
  content_id: string;
  title: string;
  address: string;
  longitude: number;
  latitude: number;
  small_category_name: "호텔" | "리조트·콘도" | "펜션·민박" | "게스트하우스" | "상관없음";
  parking: boolean;
  cooking: boolean;
  facilities: string[];
  price_per_night?: number | null;
  check_in_time?: string;
  check_out_time?: string;
}

interface LodgingRecommendationDTO {
  lodging: LodgingDTO;
  travel_min_from_last_stop: number;
  match_reason: string;
  missing_fields: string[];   // 확인 필요 정보 (명세서 5.1 Unknown 처리)
  booking_url?: string;       // 제휴 예약 링크 (12번 기능)
}
```

---

## 8. 장소 검색

명세서 10번. `GET /api/places/search?q=&category=&region=` → `PlaceDTO[]` (1번 섹션과 동일 타입).
Builder의 "포함/제외 장소" 입력도 이 검색으로 정확한 `content_id`를 받아오도록 나중에 교체 예정 —
지금은 자유 텍스트로 임시 처리 중(10번 한계 참고).

---

## 9. 저장 (장소 · 코스)

명세서 11번. 전부 로그인 필요.

| 엔드포인트 | 설명 |
|---|---|
| `GET/POST/DELETE /api/saved/places` | `SavedPlaceDTO` 목록 조회/추가/삭제 |
| `GET/POST/DELETE /api/saved/courses` | `SavedCourseDTO` 목록 조회/추가/삭제 (저장 시점 스냅샷 보관) |

```ts
interface SavedPlaceDTO { id: string; place: PlaceDTO; saved_at: string; }
interface SavedCourseDTO { id: string; title: string; trip: TripResponse; saved_at: string; }
```

---

## 10. 향후 확장 제안 (이번 범위엔 미구현)

| 엔드포인트 | 용도 | 비고 |
|---|---|---|
| `GET /api/places/{content_id}/` | 장소 상세 단건 조회 | 지도/추천 카드 등에서 필요해지면 추가 |
| `GET /api/courses/` | 공개 큐레이션 코스 목록 (List 화면용) | 백엔드에 "공개 코스" 개념 자체가 없음(`ItineraryDay`는 특정 `TripRequest`에 종속). List 화면은 이번 범위에서 프론트 정적 목업으로 유지, 이 모델이 생기면 연동 예정 |

**12. 제휴 예약**: `LodgingRecommendationDTO.booking_url`을 계약에 이미 넣어뒀지만, 실제로는 숙소 추천 UI 자체를
아직 만들지 않아서 이번 범위에서는 장소 상세(`PlaceDetailSheet`)에 "제휴 예약" 버튼만 붙였습니다(음식점
카테고리에서만 노출). 클릭하면 실제 외부 URL로 이동하지 않고 "준비 중" 안내만 보여줍니다 — 실제 제휴사
URL이 정해지면 그 값을 `booking_url`에 채워서 그대로 열면 됩니다.

---

## 11. 알려진 한계 / 백엔드팀 확인 필요 사항

1. **`region_preference`가 단일 문자열**이라 Builder는 다중선택 대신 단일선택으로 구현했습니다.
   여러 권역을 동시에 원하는 사용자 케이스가 있다면 배열로 바꾸는 걸 고려해주세요.
2. **`include_places`/`exclude_places`는 모델상 `content_id` 리스트**지만, 장소 검색 API가 없어
   프론트는 현재 사용자가 입력한 장소명(자유 텍스트)을 그대로 배열로 보냅니다. 백엔드에서
   `title`로 fuzzy match 하거나, 검색 API를 추가해주시면 정확한 매칭이 가능합니다.
3. **코스 생성 처리 시간**이 얼마나 걸릴지 몰라서 일단 동기 응답으로 가정했습니다. 오래 걸리면
   비동기 처리(작업 큐 + polling 또는 웹소켓)로 바꿔야 합니다.
4. **List 화면용 "공개 코스" 모델이 없습니다.** 필요하면 `ItineraryDay`/`ItineraryItem`을 재사용해
   "공개 여부" 플래그를 단 별도 모델을 제안드릴 수 있습니다.
5. **인증 시스템이 전부 없습니다.** `django.contrib.auth` 또는 별도 accounts 앱과 세션/토큰 발급이
   필요합니다. 지금 프론트의 `User`/`AuthSession` 타입은 최소 형태이니 실제 구현 시 조정 가능합니다.
6. **숙박 유형 명칭이 문서마다 다릅니다.** 이 계약은 `apps/places/models.py`의 `Lodging.small_category_name`
   표기(호텔/리조트·콘도/펜션·민박/게스트하우스)를 기준으로 통일했습니다. 실제 데이터의 카테고리 값과
   다르면 프론트 라벨을 맞춰드리겠습니다.
7. **코스 편집·챗봇의 "변경 지점 이후만 재계산"** 로직은 지금 프론트 목업에서는 전체 재계산으로
   단순화되어 있습니다. 실제 빔서치 엔진에서 부분 재계산을 지원하는지 확인이 필요합니다.
