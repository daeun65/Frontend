import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChipGroup from "../components/ChipGroup";
import TagInput from "../components/TagInput";
import BuilderDial from "../components/BuilderDial";
import { useCreateTrip } from "../hooks/useCreateTrip";
import {
  COMPANION_LABELS,
  FOOD_PREF_LABELS,
  PRIORITY_LABELS,
  PURPOSE_LABELS,
  REGION_LABELS,
  TRANSPORT_LABELS,
  type CompanionType,
  type CoursePriority,
  type FoodCafeBalance,
  type FoodPrefKey,
  type FoodRestriction,
  type IndoorOutdoorPref,
  type LodgingType,
  type PurposeKey,
  type RegionKey,
  type TransportMode,
  type TripRequestPayload,
} from "../api/types";

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

const PURPOSE_OPTIONS = toOptions(PURPOSE_LABELS);
const REGION_OPTIONS = toOptions(REGION_LABELS);
const TRANSPORT_OPTIONS = toOptions(TRANSPORT_LABELS);
const COMPANION_OPTIONS = toOptions(COMPANION_LABELS);
const PRIORITY_OPTIONS = toOptions(PRIORITY_LABELS);
const FOOD_PREF_OPTIONS = [{ value: "", label: "상관없음" }, ...toOptions(FOOD_PREF_LABELS)];

const MOOD_OPTIONS = [
  "조용한",
  "활기찬",
  "야경",
  "감성적인",
  "가족친화",
  "사진맛집",
  "로컬느낌",
  "이색체험",
].map((v) => ({ value: v, label: v }));

const EXCLUDE_CATEGORY_OPTIONS = ["박물관", "액티비티", "쇼핑", "체험", "공연·전시", "종교시설"].map((v) => ({
  value: v,
  label: v,
}));

const INDOOR_OUTDOOR_OPTIONS: { value: IndoorOutdoorPref; label: string }[] = [
  { value: "상관없음", label: "상관없음" },
  { value: "실내중심", label: "실내중심" },
  { value: "야외중심", label: "야외중심" },
  { value: "적절히섞기", label: "적절히 섞기" },
];

const FOOD_RESTRICTION_OPTIONS: { value: FoodRestriction; label: string }[] = [
  { value: "없음", label: "없음" },
  { value: "비건", label: "비건" },
  { value: "육류제외", label: "육류 제외" },
  { value: "해산물제외", label: "해산물 제외" },
  { value: "알레르기·기타", label: "알레르기·기타" },
];

const FOOD_CAFE_BALANCE_OPTIONS: { value: FoodCafeBalance; label: string }[] = [
  { value: "음식점중심", label: "음식점 중심" },
  { value: "카페중심", label: "카페 중심" },
  { value: "둘다", label: "둘 다" },
];

const LODGING_TYPE_OPTIONS: { value: LodgingType; label: string }[] = [
  { value: "상관없음", label: "상관없음" },
  { value: "호텔", label: "호텔" },
  { value: "리조트·콘도", label: "리조트·콘도" },
  { value: "펜션·민박", label: "펜션·민박" },
  { value: "게스트하우스", label: "게스트하우스" },
];

const LODGING_CONDITION_OPTIONS = ["주차가능", "취사가능", "반려동물 동반", "조식포함", "오션뷰"].map((v) => ({
  value: v,
  label: v,
}));

const TRIP_LENGTH_CHIPS = [
  { nights: 0, label: "당일치기" },
  { nights: 1, label: "1박2일" },
  { nights: 2, label: "2박3일" },
  { nights: 3, label: "3박4일" },
  { nights: 4, label: "4박5일" },
  { nights: 5, label: "5박6일 이상" },
];

const PRESETS = [
  { s: 10, e: 16, label: "6시간" },
  { s: 9, e: 17, label: "8시간" },
  { s: 9, e: 19, label: "10시간" },
  { s: 7, e: 19, label: "12시간" },
];

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return toDateInputValue(d);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
}

function fmtHour(h: number): string {
  return `${h.toString().padStart(2, "0")}:00`;
}

export default function BuilderPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();

  // Step 1 — dates & hours
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [nights, setNights] = useState(3);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(18);

  // Step 2 — departure & return
  const [departurePlaceId, setDeparturePlaceId] = useState("");
  const [returnToDeparture, setReturnToDeparture] = useState(false);

  // Step 3-7 — hard constraints
  const [transportMode, setTransportMode] = useState<TransportMode | "">("rental_car");
  const [companionType, setCompanionType] = useState<CompanionType | "">("couple");
  const [region, setRegion] = useState<RegionKey | "">("서귀포동부");
  const [purposeMain, setPurposeMain] = useState<PurposeKey | "">("photo");
  const [purposeSub, setPurposeSub] = useState<PurposeKey | "">("");
  const [coursePriority, setCoursePriority] = useState<CoursePriority | "">("pref");

  // Step 8-12 — soft constraints
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [includePlaces, setIncludePlaces] = useState<string[]>([]);
  const [excludePlaces, setExcludePlaces] = useState<string[]>([]);
  const [excludeCategories, setExcludeCategories] = useState<string[]>([]);
  const [walkLight, setWalkLight] = useState(false);
  const [indoorOutdoorPref, setIndoorOutdoorPref] = useState<IndoorOutdoorPref | "">("상관없음");
  const [freeTextInput, setFreeTextInput] = useState("");

  // Food
  const [foodPref1, setFoodPref1] = useState<FoodPrefKey | "">("");
  const [foodPref2, setFoodPref2] = useState<FoodPrefKey | "">("");
  const [foodRestriction, setFoodRestriction] = useState<FoodRestriction | "">("없음");
  const [foodCafeBalance, setFoodCafeBalance] = useState<FoodCafeBalance | "">("둘다");

  // Lodging
  const [lodgingCapacity, setLodgingCapacity] = useState("2");
  const [lodgingType, setLodgingType] = useState<LodgingType | "">("상관없음");
  const [lodgingConditions, setLodgingConditions] = useState<string[]>([]);
  const [lodgingBudget, setLodgingBudget] = useState("");
  const [lodgingFreeText, setLodgingFreeText] = useState("");

  const endDate = useMemo(() => addDays(startDate, nights), [startDate, nights]);
  const isMultiDay = nights > 0;
  const showFoodBalance = purposeMain === "food" || purposeSub === "food";

  const dayTripInvalid = nights === 0 && endHour <= startHour;

  const missingRequired =
    !startDate || !transportMode || !companionType || !purposeMain || !coursePriority || dayTripInvalid;

  function buildPayload(): TripRequestPayload {
    return {
      start_datetime: `${startDate}T${fmtHour(startHour)}:00`,
      end_datetime: `${endDate}T${fmtHour(endHour === 24 ? 0 : endHour)}:00`,
      departure_place_id: departurePlaceId || undefined,
      return_to_departure: returnToDeparture,
      transport_mode: transportMode as TransportMode,
      companion_type: companionType as CompanionType,
      purpose_main: purposeMain as PurposeKey,
      purpose_sub: purposeSub || undefined,
      course_priority: coursePriority as CoursePriority,
      region_preference: region || undefined,
      mood_tags: moodTags,
      include_places: includePlaces,
      exclude_places: excludePlaces,
      exclude_categories: excludeCategories,
      walk_light: walkLight,
      indoor_outdoor_pref: indoorOutdoorPref || undefined,
      free_text_input: freeTextInput || undefined,
      food_pref_1: foodPref1 || undefined,
      food_pref_2: foodPref2 || undefined,
      food_restriction: foodRestriction || undefined,
      food_cafe_balance: showFoodBalance ? foodCafeBalance || undefined : undefined,
      lodging_capacity: isMultiDay && lodgingCapacity ? Number(lodgingCapacity) : undefined,
      lodging_type: isMultiDay ? lodgingType || undefined : undefined,
      lodging_conditions: isMultiDay ? lodgingConditions : undefined,
      lodging_budget: isMultiDay && lodgingBudget ? Number(lodgingBudget) : undefined,
      lodging_free_text: isMultiDay ? lodgingFreeText || undefined : undefined,
    };
  }

  function handleSubmit() {
    if (missingRequired) return;
    createTrip.mutate(buildPayload(), {
      onSuccess: (trip) => navigate(`/trip/${trip.id}`),
    });
  }

  return (
    <div id="screen-builder">
      <section className="builder wrap">
        <div>
          <div className="intro-eyebrow">BUILD YOUR OWN JEJU TIMELINE</div>
          <h1 className="intro-title">
            가진 시간, 가고 싶은 제주 권역, 원하는 분위기.
            <br />
            조건을 알려주시면 코스를 완성해드려요.
          </h1>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">1</div>
              <div className="step-title">언제 출발해서, 언제까지 계세요?</div>
            </div>
            <div className="step-sub">출발일과 며칠 여행인지를 정하면 종료일이 자동으로 계산돼요.</div>
            <div className="date-inputs">
              <div className="date-box">
                <span className="lbl">출발일</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <span className="time-arrow">→</span>
              <div className="date-box">
                <span className="lbl">도착(종료)일</span>
                <input type="date" value={endDate} disabled />
              </div>
            </div>
            <div className="chip-row" style={{ marginTop: 14 }}>
              {TRIP_LENGTH_CHIPS.map((c) => (
                <button
                  type="button"
                  key={c.label}
                  className={`chip${nights === c.nights ? " active" : ""}`}
                  onClick={() => setNights(c.nights)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="step-sub" style={{ marginTop: 20 }}>
              하루 활동 시각 — 도착일은 시작 시각, 출발일은 종료 시각으로 반영됩니다.
            </div>
            <div className="time-inputs">
              <div className="time-box">
                <span className="lbl">시작</span>
                <button type="button" className="stepper-btn" onClick={() => setStartHour((h) => Math.max(0, h - 1))}>
                  –
                </button>
                <span className="time-val mono">{fmtHour(startHour)}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setStartHour((h) => Math.min(23, h + 1))}
                >
                  +
                </button>
              </div>
              <span className="time-arrow">→</span>
              <div className="time-box">
                <span className="lbl">종료</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setEndHour((h) => Math.max(1, h - 1))}
                >
                  –
                </button>
                <span className="time-val mono">{endHour === 24 ? "24:00" : fmtHour(endHour)}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setEndHour((h) => Math.min(24, h + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="presets">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  className="preset"
                  key={p.label}
                  onClick={() => {
                    setStartHour(p.s);
                    setEndHour(p.e);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {dayTripInvalid && <div className="form-error">당일치기는 종료 시각이 시작 시각보다 늦어야 해요.</div>}
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">2</div>
              <div className="step-title">출발지와 복귀 방식</div>
            </div>
            <div className="step-sub">출발지(공항 등)는 선택 입력이에요. 비워두면 기본값으로 처리돼요.</div>
            <div className="field-row">
              <label>출발지 (선택)</label>
              <input
                type="text"
                placeholder="예: 제주국제공항"
                value={departurePlaceId}
                onChange={(e) => setDeparturePlaceId(e.target.value)}
              />
            </div>
            <div className="toggle-row">
              <div
                className={`toggle-switch${returnToDeparture ? " on" : ""}`}
                onClick={() => setReturnToDeparture((v) => !v)}
              />
              마지막 장소에서 출발지로 다시 복귀
            </div>
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">3</div>
              <div className="step-title">이동수단이 무엇인가요?</div>
            </div>
            <ChipGroup options={TRANSPORT_OPTIONS} value={transportMode} onChange={(v) => setTransportMode(v as TransportMode)} />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">4</div>
              <div className="step-title">누구와 함께 하세요?</div>
            </div>
            <ChipGroup options={COMPANION_OPTIONS} value={companionType} onChange={(v) => setCompanionType(v as CompanionType)} />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">5</div>
              <div className="step-title">제주 어느 권역이 궁금하세요?</div>
            </div>
            <div className="step-sub">하나만 고를 수 있어요 (선택 안 하면 제주 전역에서 추천)</div>
            <ChipGroup options={REGION_OPTIONS} value={region} onChange={(v) => setRegion(v as RegionKey)} />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">6</div>
              <div className="step-title">어떤 목적의 여행인가요?</div>
            </div>
            <div className="step-sub">주목적은 필수, 보조목적은 선택이에요</div>
            <ChipGroup options={PURPOSE_OPTIONS} value={purposeMain} onChange={(v) => setPurposeMain(v as PurposeKey)} />
            <div className="step-sub" style={{ marginTop: 18 }}>보조 목적 (선택)</div>
            <ChipGroup
              options={PURPOSE_OPTIONS.filter((o) => o.value !== purposeMain)}
              value={purposeSub}
              onChange={(v) => setPurposeSub(v as PurposeKey)}
            />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">7</div>
              <div className="step-title">코스 우선순위는요?</div>
            </div>
            <ChipGroup options={PRIORITY_OPTIONS} value={coursePriority} onChange={(v) => setCoursePriority(v as CoursePriority)} />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">8</div>
              <div className="step-title">원하는 분위기 (최대 3개, 선택)</div>
            </div>
            <ChipGroup options={MOOD_OPTIONS} value={moodTags} onChange={setMoodTags} multi max={3} />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">9</div>
              <div className="step-title">꼭 가고 싶은 곳 / 빼고 싶은 곳 (선택)</div>
            </div>
            <div className="step-sub">장소명을 입력하고 Enter를 누르면 태그로 추가돼요</div>
            <TagInput value={includePlaces} onChange={setIncludePlaces} placeholder="꼭 가고 싶은 장소 추가" />
            <TagInput value={excludePlaces} onChange={setExcludePlaces} placeholder="빼고 싶은 장소 추가" />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">10</div>
              <div className="step-title">제외하고 싶은 카테고리 (선택)</div>
            </div>
            <ChipGroup options={EXCLUDE_CATEGORY_OPTIONS} value={excludeCategories} onChange={setExcludeCategories} multi />
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">11</div>
              <div className="step-title">걷는 것과 실내외 선호</div>
            </div>
            <div className="toggle-row">
              <div className={`toggle-switch${walkLight ? " on" : ""}`} onClick={() => setWalkLight((v) => !v)} />
              많이 걷지 않는 코스 선호
            </div>
            <div style={{ marginTop: 16 }}>
              <ChipGroup
                options={INDOOR_OUTDOOR_OPTIONS}
                value={indoorOutdoorPref}
                onChange={(v) => setIndoorOutdoorPref(v as IndoorOutdoorPref)}
              />
            </div>
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">12</div>
              <div className="step-title">더 하고 싶은 말이 있다면 (선택)</div>
            </div>
            <div className="field-row">
              <textarea
                placeholder="예: 아이랑 같이라 계단 많은 곳은 피하고 싶어요"
                value={freeTextInput}
                onChange={(e) => setFreeTextInput(e.target.value)}
              />
            </div>
          </div>

          <div className="step">
            <div className="step-head">
              <div className="step-num mono">13</div>
              <div className="step-title">음식 관련 선호</div>
            </div>
            <div className="step-sub">선호 음식 (최대 2개)</div>
            <ChipGroup options={FOOD_PREF_OPTIONS} value={foodPref1} onChange={(v) => setFoodPref1(v as FoodPrefKey)} />
            <div className="step-sub" style={{ marginTop: 14 }}>추가 선호 (선택)</div>
            <ChipGroup
              options={FOOD_PREF_OPTIONS.filter((o) => o.value !== foodPref1)}
              value={foodPref2}
              onChange={(v) => setFoodPref2(v as FoodPrefKey)}
            />
            <div className="step-sub" style={{ marginTop: 14 }}>식사 제한</div>
            <ChipGroup
              options={FOOD_RESTRICTION_OPTIONS}
              value={foodRestriction}
              onChange={(v) => setFoodRestriction(v as FoodRestriction)}
            />
            {showFoodBalance && (
              <>
                <div className="step-sub" style={{ marginTop: 14 }}>음식점 vs 카페 비중</div>
                <ChipGroup
                  options={FOOD_CAFE_BALANCE_OPTIONS}
                  value={foodCafeBalance}
                  onChange={(v) => setFoodCafeBalance(v as FoodCafeBalance)}
                />
              </>
            )}
          </div>

          {isMultiDay && (
            <div className="step">
              <div className="step-head">
                <div className="step-num mono">14</div>
                <div className="step-title">숙박 조건</div>
              </div>
              <div className="step-sub">다일 여행이라 숙박 조건도 함께 받을게요</div>
              <div className="field-row">
                <label>인원 수</label>
                <input
                  type="number"
                  min={1}
                  value={lodgingCapacity}
                  onChange={(e) => setLodgingCapacity(e.target.value)}
                />
              </div>
              <div className="step-sub" style={{ marginTop: 14 }}>숙소 유형</div>
              <ChipGroup options={LODGING_TYPE_OPTIONS} value={lodgingType} onChange={(v) => setLodgingType(v as LodgingType)} />
              <div className="step-sub" style={{ marginTop: 14 }}>희망 조건</div>
              <ChipGroup options={LODGING_CONDITION_OPTIONS} value={lodgingConditions} onChange={setLodgingConditions} multi />
              <div className="field-row">
                <label>1박 예산 (참고용, 원)</label>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={lodgingBudget}
                  onChange={(e) => setLodgingBudget(e.target.value)}
                />
              </div>
              <div className="field-row">
                <label>숙박 관련 자유 입력 (선택)</label>
                <textarea value={lodgingFreeText} onChange={(e) => setLodgingFreeText(e.target.value)} />
              </div>
            </div>
          )}

          <button className="cta-final" onClick={handleSubmit} disabled={missingRequired || createTrip.isPending}>
            {createTrip.isPending ? "코스를 만드는 중…" : "이 조건으로 코스 매칭받기 →"}
          </button>
          {createTrip.isError && (
            <div className="form-error">코스를 만드는 중 문제가 발생했어요. 조건을 확인하고 다시 시도해주세요.</div>
          )}
        </div>

        <aside className="preview">
          <div className="preview-card">
            <BuilderDial start={startHour} end={endHour} />
            <div className="summary">
              <h4>지금까지 설정한 조건</h4>
              <div className="sum-row">
                <span>여행 기간</span>
                <b className="mono">{TRIP_LENGTH_CHIPS.find((c) => c.nights === nights)?.label}</b>
              </div>
              <div className="sum-row">
                <span>이동수단</span>
                <b className="mono">{transportMode ? TRANSPORT_LABELS[transportMode] : "미선택"}</b>
              </div>
              <div className="sum-row">
                <span>동행</span>
                <b className="mono">{companionType ? COMPANION_LABELS[companionType] : "미선택"}</b>
              </div>
              <div className="sum-row">
                <span>희망 지역</span>
                <b className="mono">{region ? REGION_LABELS[region] : "전역"}</b>
              </div>
              <div className="sum-row">
                <span>목적</span>
                <b className="mono">
                  {purposeMain ? PURPOSE_LABELS[purposeMain] : "미선택"}
                  {purposeSub ? ` · ${PURPOSE_LABELS[purposeSub]}` : ""}
                </b>
              </div>
              <div className="sum-row">
                <span>코스 우선순위</span>
                <b className="mono">{coursePriority ? PRIORITY_LABELS[coursePriority] : "미선택"}</b>
              </div>
              <div className="sum-row">
                <span>분위기</span>
                <b className="mono">{moodTags.length ? moodTags.join(", ") : "선택 안 함"}</b>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
