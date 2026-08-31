import { useState } from "react";
import Modal from "./Modal";
import ChipGroup from "./ChipGroup";
import {
  PURPOSE_LABELS,
  PRIORITY_LABELS,
  REGION_LABELS,
  type CoursePriority,
  type DayOverridePayload,
  type PurposeKey,
  type RegionKey,
} from "../api/types";

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

const PURPOSE_OPTIONS = toOptions(PURPOSE_LABELS);
const PRIORITY_OPTIONS = toOptions(PRIORITY_LABELS);
const REGION_OPTIONS = toOptions(REGION_LABELS);

interface DayOverrideSheetProps {
  totalDays: number;
  commonPurpose: PurposeKey | "";
  commonPriority: CoursePriority | "";
  commonRegion: RegionKey | "";
  overrides: DayOverridePayload[];
  onChange: (overrides: DayOverridePayload[]) => void;
  onClose: () => void;
}

function fmtTime(h: number, m: number): string {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function DayOverrideSheet({
  totalDays,
  commonPurpose,
  commonPriority,
  commonRegion,
  overrides,
  onChange,
  onClose,
}: DayOverrideSheetProps) {
  const [activeDay, setActiveDay] = useState(1);

  const current = overrides.find((o) => o.day_index === activeDay);
  const isLastDay = activeDay === totalDays;

  function patchDay(patch: Partial<DayOverridePayload>) {
    const rest = overrides.filter((o) => o.day_index !== activeDay);
    const merged: DayOverridePayload = {
      day_index: activeDay,
      purpose_main: current?.purpose_main,
      course_priority: current?.course_priority,
      region_preference: current?.region_preference,
      lodging_arrival_time: current?.lodging_arrival_time,
      ...patch,
    };
    onChange([...rest, merged]);
  }

  function resetDay() {
    onChange(overrides.filter((o) => o.day_index !== activeDay));
  }

  function applyCommonToAll() {
    onChange([]);
  }

  const arrivalTime = current?.lodging_arrival_time ?? "15:00";
  const [ah, am] = arrivalTime.split(":").map(Number);

  function setArrival(h: number, m: number) {
    patchDay({ lodging_arrival_time: fmtTime(((h % 24) + 24) % 24, m) });
  }

  return (
    <Modal title="일자별 조건 설정" onClose={onClose} wide>
      <p style={{ marginBottom: 16 }}>
        날짜마다 목적·우선순위·권역·숙소 도착 예정 시각을 다르게 설정할 수 있어요. 설정하지 않은 날짜는 공통 조건을
        그대로 씁니다.
      </p>

      <div className="day-tabs">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
          <button
            type="button"
            key={d}
            className={`day-tab${activeDay === d ? " active" : ""}${overrides.some((o) => o.day_index === d) ? " customized" : ""}`}
            onClick={() => setActiveDay(d)}
          >
            {d}일차
          </button>
        ))}
      </div>

      <div className="override-section">
        <div className="override-label">여행 목적</div>
        <ChipGroup
          options={PURPOSE_OPTIONS}
          value={current?.purpose_main ?? commonPurpose}
          onChange={(v) => patchDay({ purpose_main: v as PurposeKey })}
        />
      </div>

      <div className="override-section">
        <div className="override-label">코스 우선순위</div>
        <ChipGroup
          options={PRIORITY_OPTIONS}
          value={current?.course_priority ?? commonPriority}
          onChange={(v) => patchDay({ course_priority: v as CoursePriority })}
        />
      </div>

      <div className="override-section">
        <div className="override-label">희망 권역</div>
        <ChipGroup
          options={REGION_OPTIONS}
          value={current?.region_preference ?? commonRegion}
          onChange={(v) => patchDay({ region_preference: v as RegionKey })}
        />
      </div>

      {!isLastDay && (
        <div className="override-section">
          <div className="override-label">숙소 도착 예정 시각</div>
          <div className="time-box" style={{ display: "inline-flex" }}>
            <button type="button" className="stepper-btn" onClick={() => setArrival(ah - 1, am)}>
              –
            </button>
            <span className="time-val mono">{fmtTime(ah, am)}</span>
            <button type="button" className="stepper-btn" onClick={() => setArrival(ah + 1, am)}>
              +
            </button>
          </div>
          <p style={{ marginTop: 8, fontSize: 11.5 }}>
            이 시각을 기준으로 당일 일정 종료와 체크인 전 짐 놓기 경유 여부가 결정돼요.
          </p>
        </div>
      )}

      <div className="override-summary">
        <h4>{activeDay}일차 현재 설정 요약</h4>
        <div className="sum-row">
          <span>여행 목적</span>
          <b className="mono">{PURPOSE_LABELS[(current?.purpose_main ?? commonPurpose) as PurposeKey] ?? "미선택"}</b>
        </div>
        <div className="sum-row">
          <span>코스 우선순위</span>
          <b className="mono">
            {PRIORITY_LABELS[(current?.course_priority ?? commonPriority) as CoursePriority] ?? "미선택"}
          </b>
        </div>
        <div className="sum-row">
          <span>희망 권역</span>
          <b className="mono">{current?.region_preference ? REGION_LABELS[current.region_preference] : commonRegion ? REGION_LABELS[commonRegion] : "전역"}</b>
        </div>
        {!isLastDay && (
          <div className="sum-row">
            <span>숙소 도착 예정</span>
            <b className="mono">{arrivalTime}</b>
          </div>
        )}
      </div>

      <div className="chip-row" style={{ marginLeft: 0, marginTop: 20 }}>
        <button type="button" className="chip" onClick={resetDay}>
          이 날짜만 공통 조건으로 되돌리기
        </button>
        <button type="button" className="chip" onClick={applyCommonToAll}>
          공통 조건을 모든 날짜에 적용
        </button>
      </div>

      <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={onClose}>
        설정 완료
      </button>
    </Modal>
  );
}
