import { useEffect, useState } from "react";
import API from "../services/api";
import TaskToolbar from "../components/Task/TaskToolbar";
import TaskItem from "../components/Task/TaskItem";
import TaskAddForm from "../components/Task/TaskAddForm";
import TaskDetailModal from "../components/Task/TaskDetailModal";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState(null); // Lưu ID của task đang được sửa
  const [editTitle, setEditTitle] = useState(""); // Lưu nội dung chữ đang gõ

  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [retainedAttachments, setRetainedAttachments] = useState([]);

  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [searchQuery, setSearchQuery] = useState(""); // Lưu từ khóa tìm kiếm
  const [sortBy, setSortBy] = useState("newest"); // Lưu tiêu chí sắp xếp (mặc định là Mới nhất)

  const [selectedTask, setSelectedTask] = useState(null); // Lưu task đang được xem chi tiết

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
    setEditingId(task._id);
    setEditTitle(task.title);
    // Lấy ngày chuẩn
    const dateStr = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "";
    setDeadline(dateStr);
    setPriority(task.priority || "Medium");

    setDescription(task.description || ""); // Đổ mô tả cũ ra
    setAttachments([]); // Reset mảng file để chuẩn bị nhận file mới nếu muốn
    setRetainedAttachments(task.attachments || []);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    // --- SỬ DỤNG FORMDATA THAY VÌ OBJECT THƯỜNG ---
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("priority", priority);

    // 1. Gửi file cũ ĐƯỢC GIỮ LẠI
    retainedAttachments.forEach(file => {
      formData.append("retainedAttachments", file);
    });

    // 2. Gửi file MỚI (giữ nguyên vòng lặp cũ của bạn)
    for (let i = 0; i < attachments.length; i++) {
      formData.append("attachments", attachments[i]);
    }

    try {
      // Gửi thẳng formData, Axios sẽ tự động lo phần Header + Boundary
      await API.put(`/tasks/${id}`, formData);

      setEditingId(null); // Tắt form sửa

      // Reset lại các trường tạm
      setDeadline("");
      setPriority("Medium");
      setDescription("");
      setAttachments([]);

      fetchTasks(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi khi sửa task", error);
    }
  };

  const updateTaskFromModal = async (id, formData) => {
    try {
      // Gọi API cập nhật
      const res = await API.put(`/tasks/${id}`, formData);

      // Tải lại danh sách bên ngoài
      fetchTasks();

      // Cập nhật luôn cục dữ liệu của Modal để nó hiển thị nội dung mới nhất ngay lập tức
      setSelectedTask(res.data);
    } catch (error) {
      console.error("Lỗi khi sửa từ Modal", error);
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

      {/* TaskAddForm */}
      <TaskAddForm
        title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        setAttachments={setAttachments}
        deadline={deadline} setDeadline={setDeadline}
        priority={priority} setPriority={setPriority}
        isAdding={isAdding} setIsAdding={setIsAdding}
        addTask={addTask}
        styles={styles}
      />

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
            <TaskItem
              key={task._id}
              task={task}
              styles={styles}
              editingId={editingId} setEditingId={setEditingId}
              editTitle={editTitle} setEditTitle={setEditTitle}
              description={description} setDescription={setDescription}
              deadline={deadline} setDeadline={setDeadline}
              priority={priority} setPriority={setPriority}
              attachments={attachments} setAttachments={setAttachments}
              saveEdit={saveEdit} startEditing={startEditing}
              toggleComplete={toggleComplete} deleteTask={deleteTask}
              onViewDetails={setSelectedTask}
              retainedAttachments={retainedAttachments}
              setRetainedAttachments={setRetainedAttachments}
            />
          ))}
        </ul>
      )}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        toggleComplete={toggleComplete}
        onUpdate={updateTaskFromModal}
      />
    </div>
  );
}

export default TaskPage;