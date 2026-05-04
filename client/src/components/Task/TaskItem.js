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
    deleteTask,
    onViewDetails,
    retainedAttachments,
    setRetainedAttachments
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
                <div style={{
                    width: "100%", padding: "16px", marginTop: "8px", marginBottom: "12px",
                    backgroundColor: "#fff", borderRadius: "10px",
                    border: "1px solid #e2e8f0", boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
                    display: "flex", flexDirection: "column", gap: "16px" // Dùng gap để tạo khoảng cách đều đặn
                }}>

                    {/* Ô nhập Tên Task (Kiểu viền dưới tinh tế) */}
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Tên công việc..."
                        style={{
                            width: "100%", fontSize: "18px", fontWeight: "600", color: "#1e293b",
                            border: "none", borderBottom: "2px solid #e2e8f0", padding: "4px 0",
                            outline: "none", transition: "border-color 0.2s", backgroundColor: "transparent"
                        }}
                        autoFocus
                        onFocus={(e) => e.target.style.borderBottom = "2px solid #3A924A"}
                        onBlur={(e) => e.target.style.borderBottom = "2px solid #e2e8f0"}
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
                        style={{
                            width: "100%", minHeight: "80px", fontSize: "14px", color: "#475569", lineHeight: "1.5",
                            padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px",
                            outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.border = "1px solid #3A924A"}
                        onBlur={(e) => e.target.style.border = "1px solid #e2e8f0"}
                    />

                    {/* Khối quản lý File Đính Kèm (Gộp file cũ và nút chọn file mới vào 1 khu vực) */}
                    <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>
                            Tệp đính kèm
                        </div>

                        {/* --- DANH SÁCH FILE CŨ --- */}
                        {retainedAttachments && retainedAttachments.length > 0 && (
                            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                                {retainedAttachments.map((file, idx) => {
                                    const isImage = file.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                    const fileUrl = `http://localhost:5000/${file}`;
                                    const originalName = file.split(/[/\\]/).pop().replace(/^\d+-\d+-/, '');

                                    return (
                                        <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                                            {/* Nút Xóa File */}
                                            <div
                                                onClick={() => {
                                                    const newRetained = retainedAttachments.filter((_, i) => i !== idx);
                                                    setRetainedAttachments(newRetained);
                                                }}
                                                style={{
                                                    position: "absolute", top: "-6px", right: "-8px",
                                                    width: "20px", height: "20px", borderRadius: "50%",
                                                    backgroundColor: "#6e6e6e", color: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", zIndex: 10, transition: "transform 0.1s, background 0.2s",
                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#3f3f3f"; e.currentTarget.style.transform = "scale(1.1)"; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#6e6e6e"; e.currentTarget.style.transform = "scale(1)"; }}
                                                title="Xóa tệp này"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </div>

                                            {/* Giao diện Ảnh hoặc Tệp */}
                                            {isImage ? (
                                                <img src={fileUrl} alt="attachment" style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e2e8f0" }} />
                                            ) : (
                                                <div style={{ padding: "0 10px", backgroundColor: "#fff", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#475569", maxWidth: "120px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: "6px", height: "56px", boxSizing: "border-box" }} title={originalName}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A924A" strokeWidth="2" flexShrink={0}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{originalName}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Nút chọn File Mới */}
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setAttachments(e.target.files)}
                            style={{ fontSize: "13px", color: "#64748b", cursor: "pointer" }}
                        />
                    </div>

                    {/* Thanh Metadata (Ngày & Ưu tiên) */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        {/* Box Ngày */}
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px 10px", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.border = "1px solid #3A924A"} onBlur={(e) => e.currentTarget.style.border = "1px solid #e2e8f0"}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3A924A" strokeWidth="2" style={{ marginRight: "8px" }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", color: "#334155", cursor: "pointer", fontFamily: "inherit" }}
                            />
                        </div>

                        {/* Box Ưu tiên */}
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "6px 10px", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.border = "1px solid #3A924A"} onBlur={(e) => e.currentTarget.style.border = "1px solid #e2e8f0"}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill={priority === "High" ? "#ef4444" : priority === "Medium" ? "#f59e0b" : "#3b82f6"} stroke="none" style={{ marginRight: "8px" }}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2"></line></svg>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ border: "none", outline: "none", backgroundColor: "transparent", fontSize: "13px", color: "#334155", cursor: "pointer", fontFamily: "inherit" }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dải Nút Hành Động (Góc Phải) */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <button
                            onClick={() => setEditingId(null)}
                            style={{ padding: "8px 16px", border: "none", backgroundColor: "transparent", color: "#64748b", fontWeight: "600", fontSize: "14px", borderRadius: "6px", cursor: "pointer", transition: "background 0.2s" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={() => saveEdit(task._id)}
                            style={{ padding: "8px 24px", border: "none", backgroundColor: "#3A924A", color: "#fff", fontWeight: "600", fontSize: "14px", borderRadius: "6px", cursor: "pointer", boxShadow: "0 2px 4px rgba(58, 146, 74, 0.25)", transition: "background 0.2s" }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2d7339"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3A924A"}
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            ) : (
                /* --- GIAO DIỆN LÚC BÌNH THƯỜNG --- */
                <>
                    <div
                        onClick={() => onViewDetails(task)}
                        style={{ display: "flex", gap: "14px", flex: 1, cursor: "pointer" }}
                    >
                        {/* 1. Nút check tròn (Đẩy nhẹ xuống 2px để cân bằng với chữ) */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleComplete(task);
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                startEditing(task)
                            }}
                            style={styles.iconBtn}
                            title="Sửa"
                            onMouseOver={(e) => { e.currentTarget.style.color = "#3A924A"; e.currentTarget.style.transform = "scale(1.1)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "#aaa"; e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task._id)
                            }}
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