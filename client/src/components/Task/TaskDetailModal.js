import React from "react";

// Hàm tiện ích format ngày
const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'short' });
};

function TaskDetailModal({ task, onClose, toggleComplete }) {
    if (!task) return null;

    return (
        // Lớp Overlay tối màu nền
        <div style={styles.overlay} onClick={onClose}>
            {/* Khối Modal chính - Bấm vào đây không bị đóng */}
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* --- THANH ĐIỀU HƯỚNG TRÊN CÙNG --- */}
                <div style={styles.topBar}>
                    <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        Inbox / {task.title.substring(0, 10)}...
                    </div>
                    <div style={{ display: "flex", gap: "16px", color: "#666" }}>
                        <button style={styles.iconBtn} onClick={onClose}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* --- NỘI DUNG CHÍNH (CHIA 2 CỘT) --- */}
                <div style={styles.body}>

                    {/* CỘT TRÁI: Nội dung, Mô tả, File đính kèm */}
                    <div style={styles.leftPane}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
                            {/* Nút Checkbox to */}
                            <div
                                onClick={() => toggleComplete(task)}
                                style={{
                                    width: "20px", height: "20px", borderRadius: "50%",
                                    border: task.completed ? "none" : "2px solid #E29F00",
                                    backgroundColor: task.completed ? "#E29F00" : "transparent",
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "4px"
                                }}
                            >
                                {task.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: "22px", color: "#202020", textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.6 : 1 }}>
                                    {task.title}
                                </h2>
                            </div>
                        </div>

                        {/* Phần Description */}
                        {task.description && (
                            <div style={{ paddingLeft: "32px", marginBottom: "30px", color: "#555", fontSize: "14px", lineHeight: "1.6" }}>
                                {task.description}
                            </div>
                        )}

                        {/* Phần Attachments (Giả lập giống Comment có ảnh) */}
                        <div style={{ marginTop: "40px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "14px", marginBottom: "20px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                Đính kèm ({task.attachments ? task.attachments.length : 0})
                            </div>

                            {task.attachments && task.attachments.map((file, idx) => {
                                const isImage = file.match(/\.(jpeg|jpg|gif|png)$/ != null);
                                const fileUrl = `http://localhost:5000/${file}`;

                                return (
                                    <div key={idx} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                                        {/* Avatar giả lập */}
                                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                                            U
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Bạn <span style={{ color: "#aaa", fontWeight: "normal", fontSize: "11px", marginLeft: "8px" }}>Tải lên lúc tạo</span></div>

                                            {/* Nếu là ảnh thì hiện ảnh, không thì hiện khung file */}
                                            {isImage ? (
                                                <img src={fileUrl} alt="attachment" style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #eee" }} />
                                            ) : (
                                                <a href={fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "8px", textDecoration: "none", color: "#374151", backgroundColor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                    <span style={{ fontSize: "13px", fontWeight: "500" }}>Tệp đính kèm {idx + 1}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* CỘT PHẢI: Thuộc tính công việc */}
                    <div style={styles.rightPane}>
                        {/* Box Thuộc tính */}
                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Date</div>
                            <div style={styles.propertyValue}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Hôm nay
                            </div>
                        </div>

                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Deadline</div>
                            <div style={styles.propertyValue}>
                                {task.deadline ? formatDate(task.deadline) : "Không có"}
                            </div>
                        </div>

                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Priority</div>
                            <div style={styles.propertyValue}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f59e0b" : "#3b82f6"} stroke="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2"></line></svg>
                                {task.priority}
                            </div>
                        </div>

                        <div style={styles.propertyBox}>
                            <div style={styles.propertyLabel}>Labels</div>
                            <div style={{ color: "#aaa", fontSize: "14px", cursor: "pointer" }}>+ Thêm nhãn</div>
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
        fontSize: "13px", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500"
    }
};

export default TaskDetailModal;