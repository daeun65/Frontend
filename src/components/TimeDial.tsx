import { useNow } from "../hooks/useNow";

const TICKS = [
  { label: "00", x: 0, y: -165 },
  { label: "03", x: 117, y: -117 },
  { label: "06", x: 165, y: 0 },
  { label: "09", x: 117, y: 117 },
  { label: "12", x: 0, y: 165 },
  { label: "15", x: -117, y: 117 },
  { label: "18", x: -165, y: 0 },
  { label: "21", x: -117, y: -117 },
];

const STOPS = [
  { label: "06:00 성산일출봉 일출", x: 165, y: 0 },
  { label: "09:00 섭지코지", x: 117, y: 117 },
  { label: "12:00 광치기 해변", x: 0, y: 165 },
  { label: "15:00 표선해수욕장", x: -117, y: 117 },
  { label: "18:00 서귀포 매일 올레시장", x: -165, y: 0 },
];

export default function TimeDial() {
  const now = useNow();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");

  return (
    <div>
      <div className="dial-wrap">
        <div className="dial" />
        <div className="dial-face" />
        <div className="dial-layer">
          {TICKS.map((t) => (
            <div
              key={t.label}
              className="tick"
              style={{ transform: `translate(-50%,-50%) translate(${t.x}px,${t.y}px)` }}
            >
              {t.label}
            </div>
          ))}
          {STOPS.map((s) => (
            <div
              key={s.label}
              className="stop"
              style={{ transform: `translate(-50%,-50%) translate(${s.x}px,${s.y}px)` }}
            >
              <div className="stop-label">{s.label}</div>
            </div>
          ))}
          <div className="dial-center">
            <div className="now-time mono">
              {hh}:{mm}
            </div>
            <div className="now-label">지금 이 시각</div>
          </div>
        </div>
      </div>
      <div className="dial-caption">
        성산·표선 당일 코스 예시 — <b>일출부터 노을까지</b>, 시간에 따라 걷는 방향이 바뀝니다.
      </div>
    </div>
  );
}
