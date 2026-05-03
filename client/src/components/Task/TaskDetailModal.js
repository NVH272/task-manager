import React, { useState, useEffect } from "react";

const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'short' });
};

const getDeadlineStatus = (date) => {
    if (!date) return null;
    const now = new Date();
    const d = new Date(date);
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = d - now;
    if (diff < 0) return "overdue";
    if (diff === 0) return "urgent";
    return "normal";
};

// Hàm tiện ích: Trích xuất tên file gốc
const getOriginalFileName = (path) => {
    if (!path) return "Tệp đính kèm";
    // 1. Lấy phần cuối cùng sau dấu / hoặc \ (ví dụ: 171439-123-Tailieu.docx)
    const fileName = path.split(/[/\\]/).pop();
    // 2. Dùng Regex xóa bỏ các cụm số và dấu gạch ngang ở đầu
    return fileName.replace(/^\d+-\d+-/, '');
};

function TaskDetailModal({ task, onClose, toggleComplete, onUpdate }) {
    // 1. STATE QUẢN LÝ INLINE EDITING
    // Lưu xem đang sửa trường nào: 'text' (Title+Desc), 'deadline', 'priority', hoặc null
    const [editingField, setEditingField] = useState(null);

    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editDeadline, setEditDeadline] = useState("");
    const [editPriority, setEditPriority] = useState("Medium");

    // 2. RESET STATE KHI ĐỔI TASK HOẶC ĐÓNG SỬA
    useEffect(() => {
        if (task) {
            setEditingField(null);
        }
    }, [task]);

    // 3. HÀM LƯU TỰ ĐỘNG THÔNG MINH
    // Chỉ cần truyền vào trường muốn update, nó sẽ lấy các trường còn lại từ task gốc
    const handleInlineSave = (updates) => {
        const formData = new FormData();
        formData.append("title", updates.title !== undefined ? updates.title : task.title);
        formData.append("description", updates.description !== undefined ? updates.description : (task.description || ""));
        formData.append("deadline", updates.deadline !== undefined ? updates.deadline : (task.deadline || ""));
        formData.append("priority", updates.priority !== undefined ? updates.priority : task.priority);

        onUpdate(task._id, formData);
        setEditingField(null); // Tắt form sửa
    };

    if (!task) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* --- THANH ĐIỀU HƯỚNG TRÊN CÙNG --- */}
                <div style={styles.topBar}>
                    <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        Inbox / {task.title.substring(0, 10)}...
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button style={styles.iconBtn} onClick={onClose} title="Đóng">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* --- NỘI DUNG CHÍNH --- */}
                <div style={styles.body}>

                    {/* CỘT TRÁI */}
                    <div style={styles.leftPane}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
                            {/* Checkbox */}
                            <div
                                onClick={() => editingField === null && toggleComplete(task)}
                                style={{
                                    width: "20px", height: "20px", borderRadius: "50%",
                                    border: task.completed ? "none" : "2px solid #E29F00",
                                    backgroundColor: task.completed ? "#E29F00" : "transparent",
                                    cursor: editingField ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: "4px",
                                    opacity: editingField ? 0.5 : 1
                                }}
                            >
                                {task.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>

                            <div style={{ flex: 1 }}>
                                {/* --- KHỐI INLINE EDITING: TÊN & MÔ TẢ --- */}
                                {editingField === 'text' ? (
                                    <div style={{ border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", padding: "10px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            style={{ ...styles.input, fontSize: "20px", fontWeight: "600", width: "100%", marginBottom: "8px" }}
                                            autoFocus
                                            placeholder="Tên công việc"
                                        />
                                        <textarea
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            placeholder="Thêm mô tả chi tiết..."
                                            style={{ ...styles.input, width: "100%", minHeight: "80px", fontSize: "14px", color: "#555" }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                                            <button onClick={() => setEditingField(null)} style={styles.btnCancel}>Cancel</button>
                                            <button
                                                onClick={() => handleInlineSave({ title: editTitle, description: editDesc })}
                                                style={styles.btnSubmit}
                                                disabled={!editTitle.trim()} // Khóa nút nếu xóa hết tên
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => {
                                            setEditTitle(task.title);
                                            setEditDesc(task.description || "");
                                            setEditingField('text');
                                        }}
                                        style={{ cursor: "text", padding: "4px", margin: "-4px", borderRadius: "6px", transition: "background-color 0.2s" }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9f9f9"}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                    >
                                        <h2 style={{ margin: 0, fontSize: "22px", color: "#202020", textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>
                                            {task.title}
                                        </h2>
                                        <div style={{ marginTop: "12px", color: task.description ? "#555" : "#aaa", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                                            {task.description || "Thêm mô tả chi tiết..."}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* HIỂN THỊ ATTACHMENTS */}
                        <div style={{ marginTop: "40px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", marginBottom: "20px", color: "#202020" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Đính kèm ({task.attachments ? task.attachments.length : 0})
                            </div>

                            {task.attachments && task.attachments.map((file, idx) => {
                                const isImage = file.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                const fileUrl = `http://localhost:5000/${file}`;

                                return (
                                    <div key={idx} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>U</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Bạn <span style={{ color: "#aaa", fontWeight: "normal", fontSize: "11px", marginLeft: "8px" }}>Tải lên lúc tạo</span></div>
                                            {/* NẾU LÀ ẢNH THÌ HIỆN ẢNH, NẾU KHÔNG THÌ HIỆN BOX TÊN FILE */}
                                            {isImage ? (
                                                <img src={fileUrl} alt="attachment" style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #eee" }} />
                                            ) : (
                                                <a href={fileUrl} target="_blank" rel="noreferrer" style={{
                                                    display: "inline-flex", alignItems: "center", gap: "10px",
                                                    padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "4px",
                                                    textDecoration: "none", color: "#666", backgroundColor: "#fff", maxWidth: "100%"
                                                }}>
                                                    {/* Icon File màu xanh nhạt */}
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>

                                                    {/* Tên file thật (có cắt gọn nếu tên quá dài) */}
                                                    <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {getOriginalFileName(file)}
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "30px", alignItems: "center", paddingBottom: "20px" }}>
                            {/* Avatar */}
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                U
                            </div>

                            {/* Ô nhập liệu bo tròn (Pill shape) */}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "10px 16px", backgroundColor: "#fff" }}>
                                <input
                                    type="text"
                                    placeholder="Comment"
                                    style={{ border: "none", outline: "none", flex: 1, fontSize: "14px", color: "#333", backgroundColor: "transparent" }}
                                />
                                {/* Icon kẹp ghim (Attachment) */}
                                <button style={{ background: "none", border: "none", cursor: "not-allowed", color: "#888", display: "flex", alignItems: "center", padding: 0 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div style={styles.rightPane}>

                        {/* INLINE EDIT: DEADLINE */}
                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Deadline</div>
                            {editingField === 'deadline' ? (
                                <input
                                    type="date"
                                    autoFocus
                                    value={editDeadline}
                                    onChange={(e) => {
                                        setEditDeadline(e.target.value);
                                        handleInlineSave({ deadline: e.target.value }); // Chọn xong lưu luôn
                                    }}
                                    onBlur={() => setEditingField(null)} // Bấm ra ngoài là tự tắt
                                    style={{ ...styles.inputBox, width: "100%" }}
                                />
                            ) : (
                                <div
                                    onClick={() => {
                                        setEditDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : "");
                                        setEditingField('deadline');
                                    }}
                                    style={{ ...styles.propertyValue, color: getDeadlineStatus(task.deadline) === "overdue" ? "#dc2626" : "#1f2937", cursor: "pointer" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {task.deadline ? formatDate(task.deadline) : "Không có"}
                                </div>
                            )}
                        </div>

                        {/* INLINE EDIT: PRIORITY */}
                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Priority</div>
                            {editingField === 'priority' ? (
                                <select
                                    autoFocus
                                    value={editPriority}
                                    onChange={(e) => {
                                        setEditPriority(e.target.value);
                                        handleInlineSave({ priority: e.target.value }); // Chọn xong lưu luôn
                                    }}
                                    onBlur={() => setEditingField(null)} // Bấm ra ngoài là tự tắt
                                    style={{ ...styles.inputBox, width: "100%" }}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            ) : (
                                <div
                                    onClick={() => {
                                        setEditPriority(task.priority || "Medium");
                                        setEditingField('priority');
                                    }}
                                    style={{ ...styles.propertyValue, cursor: "pointer" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill={task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f59e0b" : "#3b82f6"} stroke="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2"></line></svg>
                                    {task.priority}
                                </div>
                            )}
                        </div>

                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Labels</div>
                            <div style={{ color: "#aaa", fontSize: "14px", cursor: "not-allowed" }}>+ Thêm nhãn (Comming soon)</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000, backdropFilter: "blur(2px)"
    },
    modal: {
        width: "850px", height: "85vh", maxHeight: "700px",
        backgroundColor: "#fff", borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", overflow: "hidden"
    },
    topBar: {
        height: "45px", borderBottom: "1px solid #f0f0f0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 16px", backgroundColor: "#fff"
    },
    iconBtn: {
        background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex", alignItems: "center"
    },
    body: {
        display: "flex", flex: 1, overflow: "hidden"
    },
    leftPane: {
        flex: 2, padding: "24px 32px", overflowY: "auto",
        backgroundColor: "#fff"
    },
    rightPane: {
        flex: 1, backgroundColor: "#fafafa", borderLeft: "1px solid #f0f0f0",
        padding: "24px", overflowY: "auto"
    },
    propertyBox: {
        marginBottom: "24px", borderBottom: "1px solid #eaeaea", paddingBottom: "12px"
    },
    propertyLabel: {
        fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "8px"
    },
    propertyValue: {
        fontSize: "13px", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500",
        padding: "6px", margin: "-6px", borderRadius: "4px", transition: "background-color 0.2s"
    },
    input: { // Input trần không viền
        border: "none", outline: "none", backgroundColor: "transparent", boxSizing: "border-box", fontFamily: "inherit"
    },
    inputBox: { // Input có viền dùng cho cột phải
        padding: "6px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box", fontFamily: "inherit", outline: "none"
    },
    btnSubmit: {
        backgroundColor: "#db4c3f", // Màu đỏ cam chuẩn Todoist
        color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", fontWeight: "600", cursor: "pointer",
        opacity: 1 // Tự mờ đi nếu disabled
    },
    btnCancel: {
        backgroundColor: "#f5f5f5", color: "#444", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "4px", fontWeight: "600", cursor: "pointer"
    }
};

export default TaskDetailModal;