import './App.css';
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import API from "./services/api";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
    <div style={{ padding: 20 }}>
      <h1>Task Manager</h1>
      <button onClick={logout} style={{ marginBottom: 20 }}>Logout</button>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            {task.title}
            <button onClick={() => deleteTask(task._id)}>X</button>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={token ? <TaskPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
