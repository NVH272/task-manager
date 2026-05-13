import './App.css';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import API from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import TaskPage from "./pages/TaskPage";
import CompletedPage from "./pages/CompletedPage";

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kiểm tra xem trên URL có tham số ?token=... không (do Google gửi về)
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get("token");

    if (tokenFromUrl) {
      // Nếu có token trên URL:
      // - Lưu nó vào LocalStorage để dùng cho các lần sau
      localStorage.setItem("token", tokenFromUrl);
      // - Cập nhật State để React cho phép vào trang Task
      setToken(tokenFromUrl);
      window.location.href = "/tasks";

      // - (Tùy chọn) Xóa cái đoạn ?token=... trên URL cho đẹp trình duyệt
      window.history.replaceState({}, document.title, "/");
    } else {
      // 2. Nếu không có trên URL, lúc này mới tìm trong LocalStorage như cũ
      const savedToken = localStorage.getItem("token");
      setToken(savedToken);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Layout bọc TRỌN VẸN toàn bộ ứng dụng */}
        <Route path="/" element={<Layout />}>

          {/* Trang chủ */}
          <Route index element={<LandingPage />} />

          {/* 2 Trang xác thực */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Trang không gian làm việc */}
          <Route
            path="tasks"
            element={token ? <TaskPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/completed" element={<CompletedPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
