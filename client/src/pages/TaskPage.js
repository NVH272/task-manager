import { useEffect, useState } from "react";
import API from "../services/api";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState(null); // Lưu ID của task đang được sửa
  const [editTitle, setEditTitle] = useState(""); // Lưu nội dung chữ đang gõ

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

  const startEditing = (task) => {
    setEditingId(task._id); // Bật chế độ sửa cho task này
    setEditTitle(task.title); // Đổ chữ cũ vào ô input
  };

  const saveEdit = async (id) => {
    // Nếu xóa hết chữ mà bấm lưu thì tự động hủy sửa
    if (!editTitle.trim()) {
      setEditingId(null); 
      return; 
    }
    try {
      await API.put(`/tasks/${id}`, { title: editTitle });
      setEditingId(null); // Tắt form sửa
      fetchTasks(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi sửa task", error);
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
            <li 
              key={task._id} 
              style={{
                ...styles.taskItem, 
                // Xóa padding và viền khi đang ở chế độ sửa để form fit vừa vặn
                padding: editingId === task._id ? "0" : "12px 0", 
                borderBottom: editingId === task._id ? "none" : "1px solid #f0f0f0"
              }}
            >
              {/* NẾU ĐANG SỬA THÌ HIỆN FORM NÀY */}
              {editingId === task._id ? (
                <div style={{...styles.addForm, width: "100%", marginBottom: 0, marginTop: "10px"}}>
                  <input 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    style={styles.input} 
                    autoFocus 
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') saveEdit(task._id); 
                      if (e.key === 'Escape') setEditingId(null); 
                    }} 
                  />
                  <div style={styles.actionButtons}>
                    <button onClick={() => saveEdit(task._id)} style={styles.btnSubmit}>Save</button>
                    <button onClick={() => setEditingId(null)} style={styles.btnCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* NẾU BÌNH THƯỜNG THÌ HIỆN CHỮ VÀ CÁC NÚT HÀNH ĐỘNG */
                <>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "1px solid #ccc" }}></div>
                    {task.title}
                  </div>
                  
                  <div style={styles.taskActions}>
                    {/* Nút Sửa (Bút chì) */}
                    <button 
                      onClick={() => startEditing(task)} 
                      style={styles.iconBtn}
                      onMouseOver={(e) => e.currentTarget.style.color = "#3A924A"}
                      onMouseOut={(e) => e.currentTarget.style.color = "#aaa"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>

                    {/* Nút Xóa (Thùng rác) */}
                    <button 
                      onClick={() => deleteTask(task._id)} 
                      style={styles.iconBtn}
                      onMouseOver={(e) => e.currentTarget.style.color = "#E44332"}
                      onMouseOut={(e) => e.currentTarget.style.color = "#aaa"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskPage;