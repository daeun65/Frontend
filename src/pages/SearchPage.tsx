import { useState } from "react";
import { usePlaceSearch } from "../hooks/useSearch";
import PlaceDetailSheet from "../components/PlaceDetailSheet";
import ChipGroup from "../components/ChipGroup";
import { REGION_LABELS, type PlaceDTO, type RegionKey } from "../api/types";

const CATEGORY_OPTIONS = ["관광지", "음식점", "쇼핑"].map((v) => ({ value: v, label: v }));
const REGION_OPTIONS = (Object.entries(REGION_LABELS) as [RegionKey, string][]).map(([value, label]) => ({
  value,
  label,
}));

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState<RegionKey | "">("");
  const [selected, setSelected] = useState<PlaceDTO | null>(null);

  const { data: results, isLoading } = usePlaceSearch({
    q: q || undefined,
    category: category || undefined,
    region: region || undefined,
  });

  function resetFilters() {
    setQ("");
    setCategory("");
    setRegion("");
  }

  return (
    <div className="wrap" style={{ padding: "40px 32px 90px" }}>
      <div className="page-eyebrow">EXPLORE</div>
      <h1 className="page-title">장소 검색</h1>
      <p className="page-sub">이름, 관광 유형, 권역으로 제주 장소를 직접 찾아보세요.</p>

      <div className="search-bar" style={{ marginTop: 24, maxWidth: 480 }}>
        <input
          className="search-input"
          type="text"
          placeholder="장소명으로 검색 (예: 협재, 성산)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="override-section" style={{ marginTop: 20 }}>
        <div className="override-label">관광 유형</div>
        <ChipGroup options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </div>

      <div className="override-section">
        <div className="override-label">권역</div>
        <ChipGroup options={REGION_OPTIONS} value={region} onChange={(v) => setRegion(v as RegionKey)} />
      </div>

      {(q || category || region) && (
        <a className="reset-link" onClick={resetFilters}>
          필터 초기화
        </a>
      )}

      <div className="results-head" style={{ marginTop: 28 }}>
        <div className="result-count">
          {isLoading ? "검색 중…" : (
            <>
              총 <b>{results?.length ?? 0}</b>개 장소
            </>
          )}
        </div>
      </div>

      {!isLoading && (results?.length ?? 0) === 0 && (
        <div className="empty-state" style={{ padding: "70px 20px" }}>
          <span className="serif">조건에 맞는 장소가 없어요</span>
          검색어나 필터를 바꿔보세요.
        </div>
      )}

      <div className="saved-list" style={{ marginTop: 16 }}>
        {results?.map((place) => (
          <button type="button" className="saved-row saved-row-link" key={place.content_id} onClick={() => setSelected(place)}>
            <div>
              <div className="saved-row-title">{place.title}</div>
              <div className="saved-row-sub mono">
                {place.address} · {place.content_type_name}
                {place.small_category_name ? ` · ${place.small_category_name}` : ""}
              </div>
            </div>
            {place.satisfaction_score && <span className="meta-chip mono">★ {place.satisfaction_score.toFixed(2)}</span>}
          </button>
        ))}
      </div>

      {selected && <PlaceDetailSheet place={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
