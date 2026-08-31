import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../auth/AuthContext";
import { useSavePlace } from "../hooks/useSaved";
import type { PlaceDTO } from "../api/types";

interface PlaceDetailSheetProps {
  place: PlaceDTO;
  onClose: () => void;
}

interface QaEntry {
  question: string;
  answer: string;
}

function mockAnswer(place: PlaceDTO, question: string): string {
  const trimmed = question.trim();
  if (!trimmed) return "";
  const base = place.overview || `${place.title}은(는) ${place.address}에 있는 ${place.content_type_name}이에요.`;
  return `${base} "${trimmed}"에 대한 정확한 정보는 확인되지 않아, 방문 전 공식 채널에서 다시 확인해주세요.`;
}

export default function PlaceDetailSheet({ place, onClose }: PlaceDetailSheetProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const savePlace = useSavePlace();
  const [question, setQuestion] = useState("");
  const [qa, setQa] = useState<QaEntry[]>([]);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const hasBookingProduct = place.content_type_name === "음식점";

  function handleAsk() {
    if (!question.trim()) return;
    setQa((prev) => [...prev, { question, answer: mockAnswer(place, question) }]);
    setQuestion("");
  }

  function handleSave() {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }
    savePlace.mutate(place);
  }

  return (
    <Modal title={place.title} onClose={onClose}>
      <div className="place-sheet-photo" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span className="meta-chip mono">운영 중</span>
        <button type="button" className="btn-outline" onClick={handleSave} disabled={savePlace.isPending}>
          {savePlace.isSuccess ? "저장됨 ♥" : "저장 ♡"}
        </button>
      </div>

      <p style={{ marginBottom: 16 }}>
        {place.address} · {place.content_type_name}
        {place.small_category_name ? ` · ${place.small_category_name}` : ""}
      </p>

      <div className="place-fact-grid">
        <div>
          <div className="override-label">이용요금</div>
          <div>확인 필요</div>
        </div>
        <div>
          <div className="override-label">주차</div>
          <div>확인 필요</div>
        </div>
        <div>
          <div className="override-label">운영시간</div>
          <div>확인 필요</div>
        </div>
        <div>
          <div className="override-label">만족도</div>
          <div>{place.satisfaction_score ? `${place.satisfaction_score.toFixed(2)} / 5` : "정보 없음"}</div>
        </div>
      </div>

      <div className="override-section">
        <div className="override-label">추천 이유</div>
        <p>{place.overview || "이 장소가 왜 추천됐는지에 대한 설명이 아직 없어요."}</p>
      </div>

      <div className="override-section">
        <div className="override-label">장소 질문</div>
        <p style={{ marginBottom: 10 }}>이 장소에 대해 궁금한 점을 질문해 보세요.</p>
        {qa.map((entry, i) => (
          <div key={i} className="qa-entry">
            <div className="qa-q">Q. {entry.question}</div>
            <div className="qa-a">{entry.answer}</div>
          </div>
        ))}
        <div className="tag-input-row" style={{ marginLeft: 0 }}>
          <input
            type="text"
            placeholder="예: 물놀이 장비 대여 가능한가요?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAsk();
              }
            }}
          />
          <button type="button" className="btn-outline" onClick={handleAsk}>
            질문하기
          </button>
        </div>
      </div>

      {hasBookingProduct && (
        <div className="override-section">
          <div className="override-label">제휴 예약</div>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={() => setBookingMessage("실제 제휴사 연동은 준비 중이에요. 완료되면 이 버튼이 외부 예약 페이지로 연결돼요.")}
          >
            제휴 예약 페이지로 이동
          </button>
          {bookingMessage && <p style={{ marginTop: 8, fontSize: 11.5 }}>{bookingMessage}</p>}
          <p style={{ marginTop: 8, fontSize: 11 }}>
            예약과 결제는 제휴사 페이지에서 진행되며, 서비스는 예약을 확정하거나 결제를 처리하지 않아요.
          </p>
        </div>
      )}

      <div className="auth-error-banner" style={{ background: "var(--paper-deep)", borderColor: "var(--line)" }}>
        <b style={{ color: "var(--ink)" }}>확인 필요 정보</b>
        <p>데이터 최신성을 보장하지 않습니다. 실제 방문 전 운영 여부를 공식 채널에서 확인하세요.</p>
      </div>
    </Modal>
  );
}
