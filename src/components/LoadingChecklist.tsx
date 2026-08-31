import { useEffect, useState } from "react";

const STEPS = ["운영시간 확인", "이동시간 계산", "최적 동선 최적화"];
const STEP_INTERVAL_MS = 550;

interface LoadingChecklistProps {
  title?: string;
  onCancel?: () => void;
}

export default function LoadingChecklist({ title = "맞춤 코스 생성 중", onCancel }: LoadingChecklistProps) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    if (doneCount >= STEPS.length) return;
    const id = setTimeout(() => setDoneCount((c) => c + 1), STEP_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [doneCount]);

  return (
    <div className="state-panel">
      <div className="spinner" />
      <span className="serif">{title}</span>
      <p>여행 조건을 분석하고 있습니다 · 약 5~10초 소요됩니다</p>
      <ul className="loading-checklist">
        {STEPS.map((step, i) => (
          <li key={step} className={i < doneCount ? "done" : i === doneCount ? "active" : ""}>
            <span className="tick">{i < doneCount ? "✓" : i === doneCount ? "…" : "○"}</span>
            {step}
          </li>
        ))}
      </ul>
      {onCancel && (
        <button type="button" className="btn-outline" onClick={onCancel}>
          취소
        </button>
      )}
    </div>
  );
}
