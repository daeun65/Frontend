import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSavedCourses, useSavedPlaces, useDeleteSavedCourse, useDeleteSavedPlace } from "../hooks/useSaved";
import { useAuth } from "../auth/AuthContext";
import Modal from "../components/Modal";
import { commitTrip } from "../api/edit";
import type { SavedCourseDTO, SavedPlaceDTO } from "../api/types";

type DeleteTarget = { kind: "place"; item: SavedPlaceDTO } | { kind: "course"; item: SavedCourseDTO };

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: places, isLoading: placesLoading } = useSavedPlaces(isAuthenticated);
  const { data: courses, isLoading: coursesLoading } = useSavedCourses(isAuthenticated);
  const deletePlace = useDeleteSavedPlace();
  const deleteCourse = useDeleteSavedCourse();
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  function confirmDelete() {
    if (!target) return;
    if (target.kind === "place") deletePlace.mutate(target.item.id, { onSuccess: () => setTarget(null) });
    else deleteCourse.mutate(target.item.id, { onSuccess: () => setTarget(null) });
  }

  async function openCourse(course: SavedCourseDTO) {
    // The trip snapshot lives in this saved record; re-hydrate the mock trip
    // store so /trip/:id can look it up even after a reload wiped it.
    await commitTrip(course.trip.id, course.trip);
    navigate(`/trip/${course.trip.id}`);
  }

  const isLoading = placesLoading || coursesLoading;
  const isEmpty = !isLoading && (places?.length ?? 0) === 0 && (courses?.length ?? 0) === 0;

  return (
    <div className="wrap" style={{ padding: "40px 32px 90px" }}>
      <div className="results-head">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          저장함
        </h1>
        <Link className="btn-outline" to="/saved/map">
          지도에서 보기
        </Link>
      </div>

      {isLoading && (
        <div className="state-panel">
          <div className="spinner" />
        </div>
      )}

      {isEmpty && (
        <div className="empty-state" style={{ padding: "70px 20px" }}>
          <span className="serif">아직 저장한 장소나 코스가 없어요</span>
          <p style={{ marginTop: 8 }}>
            <Link to="/builder">코스 만들기</Link>에서 마음에 드는 장소나 코스를 저장해보세요.
          </p>
        </div>
      )}

      {!isLoading && (places?.length ?? 0) > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="section-title serif" style={{ fontSize: 19, marginBottom: 16 }}>
            저장한 장소
          </h2>
          <div className="saved-list">
            {places!.map((sp) => (
              <div className="saved-row" key={sp.id}>
                <div>
                  <div className="saved-row-title">{sp.place.title}</div>
                  <div className="saved-row-sub mono">
                    {sp.place.content_type_name} · {sp.place.address}
                  </div>
                </div>
                <button type="button" className="btn-outline" onClick={() => setTarget({ kind: "place", item: sp })}>
                  삭제
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && (courses?.length ?? 0) > 0 && (
        <section style={{ marginTop: 36 }}>
          <h2 className="section-title serif" style={{ fontSize: 19, marginBottom: 16 }}>
            저장한 코스
          </h2>
          <div className="saved-list">
            {courses!.map((sc) => {
              const spotCount = sc.trip.days.flatMap((d) => d.items).length;
              const hours = Math.round(sc.trip.days.reduce((s, d) => s + d.avail_hours, 0));
              return (
                <div className="saved-row" key={sc.id}>
                  <button type="button" className="saved-row-link" onClick={() => openCourse(sc)}>
                    <div className="saved-row-title">{sc.title}</div>
                    <div className="saved-row-sub mono">
                      {spotCount}곳 · 총 {hours}시간
                    </div>
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setTarget({ kind: "course", item: sc })}>
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {target && (
        <Modal title={target.kind === "place" ? "장소 삭제" : "코스 삭제"} onClose={() => setTarget(null)}>
          <p style={{ marginBottom: 20 }}>
            {target.kind === "place" ? target.item.place.title : target.item.title}을(를) 저장 목록에서
            삭제하시겠습니까?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setTarget(null)}>
              취소
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={confirmDelete}
              disabled={deletePlace.isPending || deleteCourse.isPending}
            >
              삭제
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
