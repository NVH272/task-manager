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
                // Xóa padding và viền khi đang ở chế độ sửa để form fit vừa vặn
                padding: editingId === task._id ? "0" : "12px 0",
                borderBottom: editingId === task._id ? "none" : "1px solid #f0f0f0"
            }}
        >
            {/* NẾU ĐANG SỬA THÌ HIỆN FORM NÀY */}
            {editingId === task._id ? (
                <div style={{ ...styles.addForm, width: "100%", marginBottom: 0, marginTop: "10px" }}>
                    {/* Ô nhập Tên */}
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

                    {/* Ô nhập Mô tả */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Thêm mô tả chi tiết..."
                        style={{ ...styles.input, marginTop: "10px", minHeight: "60px" }}
                    />

                    {/* Nút chọn File */}
                    <input
                        type="file"
                        multiple
                        onChange={(e) => setAttachments(e.target.files)}
                        style={{ marginTop: "10px", fontSize: "12px", width: "100%" }}
                    />

                    {/* Thanh chọn Ngày và Ưu tiên */}
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

                    {/* Nút Save / Cancel */}
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
    );
}

export default TaskItem;