import { useEffect, useState } from "react";
import API from "../services/api";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Lỗi khi tải tasks", error);
    }
  };

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      await API.post("/tasks", { title });
      setTitle("");
      setIsAdding(false); // Thêm xong thì đóng form lại cho gọn
      fetchTasks();
    } catch (error) {
      console.error("Lỗi khi thêm task", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Lỗi khi xóa task", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- STYLE OBJECTS ---
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px 40px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    header: {
      fontSize: "26px",
      fontWeight: "700",
      color: "#202020",
      borderBottom: "none",
      marginBottom: "20px",
    },
    addTaskTrigger: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#666",
      cursor: "pointer",
      padding: "8px 0",
      fontSize: "14px",
      fontWeight: "500",
      border: "none",
      backgroundColor: "transparent",
      transition: "color 0.2s",
    },
    addIcon: {
      color: "#3A924A", // Tông màu xanh lá của bạn
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "18px",
      height: "18px",
      borderRadius: "50%",
    },
    addForm: {
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      border: "none",
      outline: "none",
      fontSize: "14px",
      padding: "5px",
      boxSizing: "border-box",
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
      marginTop: "10px",
    },
    btnSubmit: {
      backgroundColor: "#3A924A",
      color: "white",
      border: "none",
      padding: "6px 12px",
      borderRadius: "4px",
      fontWeight: "bold",
      cursor: "pointer",
    },
    btnCancel: {
      backgroundColor: "transparent",
      color: "#555",
      border: "none",
      padding: "6px 12px",
      borderRadius: "4px",
      cursor: "pointer",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "60px",
      color: "#202020",
    },
    emptyImage: {
      width: "220px",
      marginBottom: "20px",
    },
    taskList: {
      listStyleType: "none",
      padding: 0,
      marginTop: "20px",
    },
    taskItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px solid #f0f0f0",
      fontSize: "14px",
      color: "#202020",
    },
    deleteBtn: {
      background: "transparent",
      color: "#aaa",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Today</h1>

      {/* --- NÚT BẬT FORM THÊM TASK --- */}
      {!isAdding ? (
        <button 
          style={styles.addTaskTrigger} 
          onClick={() => setIsAdding(true)}
          onMouseOver={(e) => e.currentTarget.style.color = "#3A924A"}
          onMouseOut={(e) => e.currentTarget.style.color = "#666"}
        >
          <span style={styles.addIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          Add task
        </button>
      ) : (
        /* --- FORM THÊM TASK KHI ĐƯỢC BẬT --- */
        <div style={styles.addForm}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên công việc..."
            style={styles.input}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask();
              if (e.key === 'Escape') setIsAdding(false);
            }}
          />
          <div style={styles.actionButtons}>
            <button onClick={addTask} style={styles.btnSubmit}>Add task</button>
            <button onClick={() => setIsAdding(false)} style={styles.btnCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- HIỂN THỊ DANH SÁCH HOẶC EMPTY STATE --- */}
      {tasks.length === 0 ? (
        <div style={styles.emptyState}>
          {/* Bạn có thể tải bức ảnh chú ong trong hình của bạn về, bỏ vào thư mục public/images và đổi src thành "/images/empty-state.png" */}
          <img 
            src="https://illustrations.popsy.co/amber/surreal-hourglass.svg" 
            alt="All done" 
            style={styles.emptyImage}
          />
          <p style={{ fontSize: "15px", fontWeight: "500" }}>You're all done for today!</p>
        </div>
      ) : (
        <ul style={styles.taskList}>
          {tasks.map(task => (
            <li key={task._id} style={styles.taskItem}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {/* Nút check tròn (chỉ mang tính trang trí) */}
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid #ccc" }}></div>
                {task.title}
              </div>
              <button 
                onClick={() => deleteTask(task._id)} 
                style={styles.deleteBtn}
                onMouseOver={(e) => e.target.style.color = "#E44332"}
                onMouseOut={(e) => e.target.style.color = "#aaa"}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskPage;