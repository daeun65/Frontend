import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav>
      <div className="logo">
        <span className="dot" />
        시간여행 제주
      </div>
      <div className="navlinks">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "on" : "")}>
          홈
        </NavLink>
        <NavLink to="/list" className={({ isActive }) => (isActive ? "on" : "")}>
          추천 코스
        </NavLink>
        <NavLink to="/builder" className={({ isActive }) => (isActive ? "on" : "")}>
          나만의 코스 만들기
        </NavLink>
      </div>
      <NavLink to="/builder" className="nav-cta">
        코스 매칭 시작 →
      </NavLink>
    </nav>
  );
}
