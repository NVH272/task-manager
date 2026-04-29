import React from "react";

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

function TaskItem({
    task,
    styles, // Nhận object styles từ cha truyền xuống
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    description,
    setDescription,
    deadline,
    setDeadline,
    priority,
    setPriority,
    attachments,
    setAttachments,
    saveEdit,
    startEditing,
    toggleComplete,
    deleteTask
}) {
    const isEditing = editingId === task._id;

    return (
        <li
            key={task._id}
            style={{
                ...styles.taskItem,
                padding: isEditing ? "0" : "16px 0",
                borderBottom: isEditing ? "none" : "1px solid #f4f4f4",
                alignItems: "flex-start" // Ép mọi thứ căn từ trên xuống
            }}
        >
            {/* --- FORM KHI ĐANG SỬA --- */}
            {isEditing ? (
                <div style={{ ...styles.addForm, width: "100%", marginBottom: 0, marginTop: "10px", backgroundColor: "#fafafa" }}>
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ ...styles.input, fontWeight: "600", fontSize: "15px" }}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task._id);
                            if (e.key === 'Escape') setEditingId(null);
                        }}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Thêm mô tả chi tiết..."
                        style={{ ...styles.input, marginTop: "8px", minHeight: "60px", fontSize: "13px", lineHeight: "1.4" }}
                    />
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setAttachments(e.target.files)}
                        style={{ marginTop: "12px", fontSize: "12px", width: "100%" }}
                    />
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
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
                    <div style={{ ...styles.actionButtons, marginTop: "16px" }}>
                        <button onClick={() => saveEdit(task._id)} style={styles.btnSubmit}>Lưu</button>
                        <button onClick={() => setEditingId(null)} style={styles.btnCancel}>Hủy</button>
                    </div>
                </div>
            ) : (
                /* --- GIAO DIỆN LÚC BÌNH THƯỜNG --- */
                <>
                    <div style={{ display: "flex", gap: "14px", flex: 1 }}>
                        {/* 1. Nút check tròn (Đẩy nhẹ xuống 2px để cân bằng với chữ) */}
                        <div
                            onClick={() => toggleComplete(task)}
                            style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                border: task.completed ? "none" : "2px solid #ddd",
                                backgroundColor: task.completed ? "#3A924A" : "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "2px",
                                transition: "all 0.2s"
                            }}
                        >
                            {task.completed && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>

                        {/* 2. Nội dung công việc (Tên, Mô tả, Tags) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, opacity: task.completed ? 0.6 : 1 }}>

                            {/* Tên Task */}
                            <span style={{
                                textDecoration: task.completed ? "line-through" : "none",
                                color: task.completed ? "#888" : "#202020",
                                fontWeight: "500",
                                fontSize: "15px",
                                transition: "all 0.2s"
                            }}>
                                {task.title}
                            </span>

                            {/* Mô tả (Nhỏ hơn, xám) */}
                            {task.description && (
                                <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.4" }}>
                                    {task.description}
                                </p>
                            )}

                            {/* Khối chứa Tags và Files (Gắn kết gọn gàng) */}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                                {/* Tag Mức độ ưu tiên */}
                                {task.priority && (
                                    <span style={{
                                        fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "12px",
                                        backgroundColor: task.priority === "High" ? "#fee2e2" : task.priority === "Medium" ? "#fef3c7" : "#f1f5f9",
                                        color: task.priority === "High" ? "#dc2626" : task.priority === "Medium" ? "#d97706" : "#475569"
                                    }}>
                                        {task.priority}
                                    </span>
                                )}

                                {/* Tag Hạn chót */}
                                {task.deadline && (
                                    <span style={{
                                        fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "12px",
                                        backgroundColor: getDeadlineStatus(task.deadline) === "overdue" ? "#fee2e2" : getDeadlineStatus(task.deadline) === "urgent" ? "#fef3c7" : "#f1f5f9",
                                        color: getDeadlineStatus(task.deadline) === "overdue" ? "#dc2626" : getDeadlineStatus(task.deadline) === "urgent" ? "#d97706" : "#475569"
                                    }}>
                                        {new Date(task.deadline).toLocaleDateString("vi-VN")}
                                        {getDeadlineStatus(task.deadline) === "overdue" ? " (Quá hạn)" : ""}
                                        {getDeadlineStatus(task.deadline) === "urgent" ? " (Hôm nay)" : ""}
                                    </span>
                                )}

                                {/* Tag File Đính kèm */}
                                {task.attachments && task.attachments.length > 0 && task.attachments.map((file, index) => (
                                    <a key={index} href={`http://localhost:5000/${file}`} target="_blank" rel="noreferrer"
                                        style={{
                                            fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "12px",
                                            backgroundColor: "#e0f2fe", color: "#2563eb", textDecoration: "none",
                                            display: "flex", alignItems: "center", gap: "4px"
                                        }}
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                        File {index + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Khối Nút Hành Động (Sửa / Xóa) */}
                    <div style={{ display: "flex", gap: "8px", opacity: 0.6, paddingTop: "2px" }}>
                        <button
                            onClick={() => startEditing(task)}
                            style={styles.iconBtn}
                            title="Sửa"
                            onMouseOver={(e) => { e.currentTarget.style.color = "#3A924A"; e.currentTarget.style.transform = "scale(1.1)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                            onClick={() => deleteTask(task._id)}
                            style={styles.iconBtn}
                            title="Xóa"
                            onMouseOver={(e) => { e.currentTarget.style.color = "#E44332"; e.currentTarget.style.transform = "scale(1.1)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </>
            )}
        </li>
    );
}

export default TaskItem;