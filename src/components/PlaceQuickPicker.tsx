import { useState } from "react";

const QUICK_PLACES = ["제주국제공항", "제주항 연안여객터미널", "성산항", "서귀포항"];

interface PlaceQuickPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PlaceQuickPicker({ value, onChange, placeholder }: PlaceQuickPickerProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const results = query.trim()
    ? QUICK_PLACES.filter((p) => p.includes(query.trim()))
    : [];

  function choose(place: string) {
    onChange(place);
    setQuery("");
    setShowResults(false);
  }

  return (
    <div>
      <div className="quick-pick-row">
        {QUICK_PLACES.map((p) => (
          <button
            type="button"
            key={p}
            className={`quick-pick-chip${value === p ? " active" : ""}`}
            onClick={() => choose(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="quick-pick-search">
        <input
          type="text"
          value={value && !query ? value : query}
          placeholder={placeholder ?? "장소 검색 (예: 제주국제공항)"}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
        />
        {showResults && results.length > 0 && (
          <div className="quick-pick-results">
            {results.map((p) => (
              <button type="button" key={p} onMouseDown={() => choose(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
