// Mirrors API_CONTRACT.md at the repo root. Keep in sync with that document.

export type PurposeKey =
  | "nature"
  | "food"
  | "photo"
  | "culture"
  | "activity"
  | "shopping";

export const PURPOSE_LABELS: Record<PurposeKey, string> = {
  nature: "힐링/자연",
  food: "식당/카페",
  photo: "사진/감성",
  culture: "문화/역사",
  activity: "체험/액티비티",
  shopping: "쇼핑/시장",
};

export type RegionKey =
  | "제주시동부"
  | "제주시서부"
  | "제주시내"
  | "서귀포동부"
  | "서귀포서부"
  | "전역";

export const REGION_LABELS: Record<RegionKey, string> = {
  제주시동부: "제주시 동부 (조천·구좌)",
  제주시서부: "제주시 서부 (한림·애월)",
  제주시내: "제주 시내 (원도심)",
  서귀포동부: "서귀포 동부 (성산·표선)",
  서귀포서부: "서귀포 서부 (안덕·대정)",
  전역: "제주 전역 무관",
};

export type TransportMode = "rental_car" | "own_car" | "taxi";

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  rental_car: "렌터카",
  own_car: "자가용",
  taxi: "택시",
};

export type CompanionType =
  | "alone"
  | "couple"
  | "friend"
  | "family_kids"
  | "parents"
  | "group";

export const COMPANION_LABELS: Record<CompanionType, string> = {
  alone: "혼자",
  couple: "연인/배우자",
  friend: "친구",
  family_kids: "아이와 가족",
  parents: "부모님",
  group: "단체",
};

export type CoursePriority = "dist" | "pref" | "relax";

export const PRIORITY_LABELS: Record<CoursePriority, string> = {
  dist: "이동 최소 코스",
  pref: "취향 중심 코스",
  relax: "여유로운 코스",
};

export type IndoorOutdoorPref = "상관없음" | "실내중심" | "야외중심" | "적절히섞기";

export type FoodRestriction = "없음" | "비건" | "육류제외" | "해산물제외" | "알레르기·기타";

export type FoodCafeBalance = "음식점중심" | "카페중심" | "둘다";

export type FoodPrefKey =
  | "제주향토음식"
  | "고기구이"
  | "해산물요리"
  | "회물회초밥"
  | "한식"
  | "면요리"
  | "분식간편식"
  | "일식"
  | "중식"
  | "양식세계음식";

export const FOOD_PREF_LABELS: Record<FoodPrefKey, string> = {
  제주향토음식: "제주 향토음식",
  고기구이: "고기·구이",
  해산물요리: "해산물 요리",
  회물회초밥: "회·물회·초밥",
  한식: "한식",
  면요리: "면 요리",
  분식간편식: "분식·간편식",
  일식: "일식",
  중식: "중식",
  양식세계음식: "양식·세계음식",
};

export type LodgingType = "호텔" | "리조트·콘도" | "펜션·민박" | "게스트하우스" | "상관없음";

export interface TripRequestPayload {
  start_datetime: string;
  end_datetime: string;
  departure_place_id?: string;
  return_to_departure: boolean;

  transport_mode: TransportMode;
  companion_type: CompanionType;
  purpose_main: PurposeKey;
  purpose_sub?: PurposeKey;
  course_priority: CoursePriority;
  region_preference?: RegionKey;

  mood_tags?: string[];
  include_places?: string[];
  exclude_places?: string[];
  exclude_categories?: string[];
  walk_light?: boolean;
  indoor_outdoor_pref?: IndoorOutdoorPref;

  free_text_input?: string;

  food_pref_1?: FoodPrefKey;
  food_pref_2?: FoodPrefKey;
  food_restriction?: FoodRestriction;
  food_cafe_balance?: FoodCafeBalance;

  lodging_capacity?: number;
  lodging_type?: LodgingType;
  lodging_conditions?: string[];
  lodging_budget?: number;
  lodging_free_text?: string;
}

export type Quadrant = "NE" | "NW" | "SE" | "SW";

export interface PlaceDTO {
  content_id: string;
  title: string;
  address: string;
  longitude: number;
  latitude: number;
  overview?: string;
  content_type_name: string;
  small_category_name?: string;
  quadrant: Quadrant;
  satisfaction_score?: number | null;
}

export type SlotType = "GENERAL" | "RESTAURANT" | "CAFE" | "SNACK";

export interface ItineraryItemDTO {
  order: number;
  slot_type: SlotType;
  place: PlaceDTO;
  arrive_at: string;
  depart_at: string;
  stay_min: number;
  travel_min_from_prev?: number | null;
  hours_uncertain?: boolean;
  pref_score?: number | null;
  adjusted_qual?: number | null;
}

export type DayCase = "A" | "B" | "C" | "D";

export interface ItineraryDayDTO {
  day_index: number;
  day_case: DayCase;
  avail_hours: number;
  target_slots: number;
  need_lunch: boolean;
  need_dinner: boolean;
  need_night_spot: boolean;
  lodging?: PlaceDTO | null;
  items: ItineraryItemDTO[];
}

export interface TripResponse {
  id: string;
  created_at: string;
  request: TripRequestPayload;
  total_days: number;
  days: ItineraryDayDTO[];
}

export interface FieldErrors {
  field_errors?: Record<string, string[]>;
}
