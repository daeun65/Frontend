import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import TabBar from "./components/TabBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ListPage from "./pages/ListPage";
import BuilderPage from "./pages/BuilderPage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/trip/:id" element={<DetailPage />} />
        <Route
          path="*"
          element={
            <div className="state-panel">
              <span className="serif">페이지를 찾을 수 없어요</span>
            </div>
          }
        />
      </Routes>
      <Footer />
      <TabBar />
    </>
  );
}
