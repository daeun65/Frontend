import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "홈", icon: "⌂", end: true },
  { to: "/list", label: "코스", icon: "▤", end: false },
  { to: "/builder", label: "만들기", icon: "◎", end: false },
];

export default function TabBar() {
  return (
    <div className="tabbar">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `tab-item${isActive ? " active" : ""}`}
        >
          <div className="ic">{item.icon}</div>
          <div>{item.label}</div>
        </NavLink>
      ))}
    </div>
  );
}
