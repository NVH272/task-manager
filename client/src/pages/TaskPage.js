import { useEffect, useState } from "react";
import API from "../services/api";

const getDeadlineStatus = (date) => {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date);
  now.setHours(0, 0, 0, 0); // Đưa về 0h để tính số ngày cho chuẩn
  d.setHours(0, 0, 0, 0);
  const diff = d - now;
  if (diff < 0) return "overdue"; // Quá hạn
  if (diff === 0) return "urgent"; // Sắp hết hạn (trong hôm nay)
  return "normal";
};

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState(null); // Lưu ID của task đang được sửa
  const [editTitle, setEditTitle] = useState(""); // Lưu nội dung chữ đang gõ

  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [searchQuery, setSearchQuery] = useState(""); // Lưu từ khóa tìm kiếm
  const [sortBy, setSortBy] = useState("newest"); // Lưu tiêu chí sắp xếp (mặc định là Mới nhất)

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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("priority", priority);

    // Đính kèm các file
    for (let i = 0; i < attachments.length; i++) {
      formData.append("attachments", attachments[i]);
    }

    try {
      // Lưu ý: Phải gửi formData thay vì object { }
      await API.post("/tasks", formData);

      // Reset form...
      setTitle("");
      setDescription("");
      setAttachments([]);
      setIsAdding(false);
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
    // Lấy ngày chuẩn (YYYY-MM-DD) để đổ vào input type="date"
    const dateStr = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "";
    setDeadline(dateStr);
    setPriority(task.priority || "Medium");
  };

  const saveEdit = async (id) => {
    // Nếu xóa hết chữ mà bấm lưu thì tự động hủy sửa
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      // Gửi cả ngày và ưu tiên lên khi sửa
      await API.put(`/tasks/${id}`, { title: editTitle, deadline, priority });
      setEditingId(null); // Tắt form sửa
      // Reset lại các trường tạm
      setDeadline("");
      setPriority("Medium");
      fetchTasks(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi sửa task", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái", error);
    }
  };

  // --- LOGIC TÌM KIẾM VÀ SẮP XẾP ---
  const displayedTasks = tasks
    // 1. TÌM KIẾM: Giữ lại những task có chứa từ khóa (không phân biệt hoa/thường)
    .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()))
    // 2. SẮP XẾP:
    .sort((a, b) => {
      if (sortBy === "priority") {
        // Quy đổi độ ưu tiên thành điểm: High=3, Medium=2, Low=1
        const pMap = { High: 3, Medium: 2, Low: 1 };
        const scoreA = pMap[a.priority] || 1;
        const scoreB = pMap[b.priority] || 1;
        return scoreB - scoreA; // Điểm cao (High) xếp trước
      }
      else if (sortBy === "deadline") {
        // Nếu không có hạn chót, đẩy xuống cuối cùng
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline); // Ngày gần nhất lên trước
      }
      else {
        // newest (Mặc định): Mới tạo xếp lên đầu
        // Nhờ MongoDB có { timestamps: true } nên ta có thể dùng createdAt
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

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
    inputSmall: {
      padding: "6px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "13px",
      outline: "none"
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
      alignItems: "flex-start", // Đổi thành flex-start để các dòng căng đều từ trên xuống
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
    },
    iconBtn: {
      background: "transparent",
      color: "#aaa",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      transition: "color 0.2s",
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Today</h1>

      {/* --- THANH CÔNG CỤ: TÌM KIẾM & SẮP XẾP --- */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
        <input
          type="text"
          placeholder="Tìm kiếm công việc..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...styles.input, border: "1px solid #ddd", borderRadius: "4px", padding: "8px 12px", flex: 1 }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", outline: "none", cursor: "pointer" }}
        >
          <option value="newest">Mới nhất</option>
          <option value="priority">Ưu tiên cao nhất</option>
          <option value="deadline">Hạn chót gần nhất</option>
        </select>
      </div>

      {/* --- NÚT BẬT FORM THÊM TASK --- */}
      {!isAdding ? (
        <button
          style={styles.addTaskTrigger}
          onClick={() => {
            setIsAdding(true);
            setDeadline(""); // Reset form mỗi khi mở
            setPriority("Medium");
          }}
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
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả chi tiết..."
            style={{ ...styles.input, marginTop: "10px", minHeight: "60px" }}
          />

          <input
            type="file"
            multiple // Cho phép chọn nhiều file
            onChange={(e) => setAttachments(e.target.files)}
            style={{ marginTop: "10px", fontSize: "12px" }}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={styles.inputSmall}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.inputSmall}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
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
          {displayedTasks.map(task => (
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
                <div style={{ ...styles.addForm, width: "100%", marginBottom: 0, marginTop: "10px" }}>
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
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      style={styles.inputSmall}
                    />
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      style={styles.inputSmall}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div style={styles.actionButtons}>
                    <button onClick={() => saveEdit(task._id)} style={styles.btnSubmit}>Save</button>
                    <button onClick={() => setEditingId(null)} style={styles.btnCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* NẾU BÌNH THƯỜNG THÌ HIỆN CHỮ VÀ CÁC NÚT HÀNH ĐỘNG */
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      {/* Nút check tròn (Giờ đã có thể bấm, đổi màu và có dấu tick) */}
                      <div
                        onClick={() => toggleComplete(task)}
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: task.completed ? "none" : "1px solid #ccc",
                          backgroundColor: task.completed ? "#3A924A" : "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0 // Đảm bảo nút tròn không bị méo khi tên dài
                        }}
                      >
                        {task.completed && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                        {/* Hiển thị Description nếu có */}
                        {task.description && (
                          <p style={{ marginLeft: "28px", fontSize: "13px", color: "#555", margin: "4px 0" }}>
                            {task.description}
                          </p>
                        )}

                        {/* Hiển thị danh sách Attachment nếu có */}
                        {task.attachments && task.attachments.length > 0 && (
                          <div style={{ marginLeft: "28px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {task.attachments.map((file, index) => (
                              <a key={index} href={`http://localhost:5000/${file}`} target="_blank" rel="noreferrer"
                                style={{ fontSize: "11px", color: "#3A924A", textDecoration: "none", border: "1px solid #3A924A", padding: "2px 6px", borderRadius: "4px" }}>
                                File {index + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tên công việc (Làm mờ và gạch ngang nếu đã xong) */}
                      <span style={{
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "#aaa" : "#202020",
                        transition: "all 0.2s"
                      }}>
                        {task.title}
                      </span>
                    </div>

                    {/* HIỂN THỊ TAG HẠN CHÓT & ƯU TIÊN */}
                    <div style={{ display: "flex", gap: "12px", marginLeft: "28px", fontSize: "12px", opacity: task.completed ? 0.5 : 1 }}>
                      {task.priority && (
                        <span style={{ color: task.priority === "High" ? "#E44332" : task.priority === "Medium" ? "#E29F00" : "#888", fontWeight: "600" }}>
                          {task.priority}
                        </span>
                      )}
                      {task.deadline && (
                        <span style={{
                          color: getDeadlineStatus(task.deadline) === "overdue" ? "#E44332" : getDeadlineStatus(task.deadline) === "urgent" ? "#E29F00" : "#888",
                          fontWeight: getDeadlineStatus(task.deadline) !== "normal" ? "600" : "normal"
                        }}>
                          {new Date(task.deadline).toLocaleDateString("vi-VN")}
                          {getDeadlineStatus(task.deadline) === "overdue" ? " (Quá hạn)" : ""}
                          {getDeadlineStatus(task.deadline) === "urgent" ? " (Hôm nay)" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "12px", opacity: 0.7, paddingTop: "2px" }}>
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