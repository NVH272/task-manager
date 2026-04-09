import './App.css';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import API from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!title) return;
    await API.post("/tasks", { title });
    setTitle("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ background: "white", padding: 20, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập công việc mới..."
          style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button onClick={addTask} style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Thêm
        </button>
      </div>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map(task => (
          <li key={task._id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid #eee" }}>
            {task.title}
            <button onClick={() => deleteTask(task._id)} style={{ background: "#ff4d4f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", padding: "4px 8px" }}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
