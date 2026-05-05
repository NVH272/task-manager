import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";


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
    const [activeDropdown, setActiveDropdown] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);

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

    // Hàm xử lý xóa tệp đính kèm ngay lập tức
    const handleDeleteAttachment = (idxToRemove) => {
        // Lọc bỏ file bị xóa
        const newAttachments = task.attachments.filter((_, idx) => idx !== idxToRemove);

        // Đóng gói dữ liệu gửi lên Backend
        const formData = new FormData();
        formData.append("title", task.title);
        formData.append("description", task.description || "");
        formData.append("deadline", task.deadline || "");
        formData.append("priority", task.priority || "Medium");

        // Gửi lại danh sách file cũ đã được lọc (retainedAttachments)
        newAttachments.forEach(file => {
            formData.append("retainedAttachments", file);
        });

        // Gọi hàm update của trang cha
        onUpdate(task._id, formData);
        setActiveDropdown(null); // Đóng menu
    };

    // --- HÀM GỬI COMMENT ---
    const handleCommentSubmit = async () => {
        // Nếu không gõ chữ và cũng không chọn file thì không làm gì cả
        if (!commentText.trim() && commentFiles.length === 0) return;

        const formData = new FormData();
        formData.append("text", commentText);

        // Đính kèm các file mới chọn vào form
        for (let i = 0; i < commentFiles.length; i++) {
            formData.append("attachments", commentFiles[i]);
        }

        try {
            // Gọi API tạo comment mới (Giả sử Backend bạn đã thiết lập route này)
            const res = await API.post(`/tasks/${task._id}/comments`, formData);

            // Thành công thì xóa trắng ô nhập và danh sách file tạm
            setCommentText("");
            setCommentFiles([]);

            // Báo cho TaskPage biết để cập nhật lại dữ liệu mới nhất
            if (onUpdate) {
                // Tùy vào cách bạn viết onUpdate, có thể gọi lại API fetchTasks ở ngoài hoặc truyền data mới ra
                onUpdate(task._id, null, res.data);
            }
        } catch (error) {
            console.error("Lỗi khi gửi comment:", error);
        }
    };

    // --- HÀM XÓA COMMENT ---
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

        try {
            // MẸO DEBUG 1: In ra ID để xem có bị undefined không
            console.log("Đang xóa comment ID:", commentId, "thuộc Task ID:", task._id);

            // Gọi API xóa comment
            const res = await API.delete(`/tasks/${task._id}/comments/${commentId}`);

            // Cập nhật lại giao diện
            if (onUpdate) {
                onUpdate(task._id, null, res.data);
            }
            setActiveDropdown(null);
        } catch (error) {
            // Đã bỏ alert() theo yêu cầu.
            // MẸO DEBUG 2: In ra chi tiết mã lỗi từ Backend trả về
            console.error("Lỗi khi xóa comment!");
            console.error("Chi tiết Backend phản hồi:", error.response?.data);
            console.error("Status Code:", error.response?.status);
        }
    };

    if (!task) return null;
    // --- BƯỚC 1: TẠO DÒNG THỜI GIAN (ACTIVITY FEED) ---
    let activityFeed = [];

    if (task) {
        // 1. Biến từng file đính kèm ban đầu thành 1 "hành động"
        if (task.attachments && task.attachments.length > 0) {
            task.attachments.forEach((file, idx) => {
                activityFeed.push({
                    type: 'initial_file',
                    file: file,
                    originalIndex: idx, // Giữ lại số thứ tự gốc để tí nữa gọi hàm xóa cho đúng
                    createdAt: task.createdAt // File ban đầu lấy theo giờ tạo task
                });
            });
        }

        // 2. Nhét các comment vào chung mảng
        if (task.comments && task.comments.length > 0) {
            task.comments.forEach(cmt => {
                activityFeed.push({
                    type: 'comment',
                    commentId: cmt._id,
                    text: cmt.text,
                    files: cmt.attachments || [],
                    createdAt: cmt.createdAt
                });
            });
        }

        // 3. Phép thuật ở đây: Sắp xếp mảng gộp này theo thứ tự MỚI NHẤT -> CŨ NHẤT
        activityFeed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
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

                        {/* --- KHU VỰC CUỘN ĐƯỢC (Tên, Checkbox, Mô tả, File) --- */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>

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

                            {/* --- DÒNG THỜI GIAN: COMMENT & ATTACHMENTS --- */}
                            <div style={{ marginTop: "40px", borderTop: "1px solid #f0f0f0", paddingTop: "20px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#202020", marginBottom: "20px" }}>
                                    Hoạt động
                                </div>

                                {/* Duyệt qua mảng gộp đã sắp xếp */}
                                {activityFeed.map((activity, index) => {
                                    const timeString = new Date(activity.createdAt).toLocaleString("vi-VN", {
                                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                                    });

                                    return (
                                        <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                                            {/* Avatar */}
                                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                                U
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                                                {/* Header: Tên & Thời gian */}
                                                {/* Header: Tên & Thời gian & NÚT 3 CHẤM DÙNG CHUNG */}
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#202020" }}>
                                                        Bạn <span style={{ color: "#888", fontWeight: "normal", fontSize: "11px", marginLeft: "8px" }}>{timeString}</span>
                                                    </div>

                                                    {/* NÚT 3 CHẤM MENU DÙNG CHUNG CẢ FILE LẪN COMMENT */}
                                                    <div className="activity-dropdown-wrapper" style={{ position: "relative" }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Dùng index của mảng activityFeed để định danh cho UI Menu (đảm bảo mỗi item có 1 menu riêng)
                                                                setActiveDropdown(activeDropdown === index ? null : index);
                                                            }}
                                                            style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: "0 4px" }}
                                                            onMouseOver={(e) => e.currentTarget.style.color = "#333"}
                                                            onMouseOut={(e) => e.currentTarget.style.color = "#888"}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                                        </button>

                                                        {/* MENU DROPDOWN CHUNG */}
                                                        {activeDropdown === index && (
                                                            <div style={{
                                                                position: "absolute", top: "100%", right: 0, marginTop: "4px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", zIndex: 50, width: "120px", overflow: "hidden"
                                                            }}>
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveDropdown(null);
                                                                        alert('Tính năng sửa đang phát triển!');
                                                                    }}
                                                                    style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#374151" }}
                                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                                >
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        // Kiểm tra xem đang xóa File hay Comment để gọi hàm cho đúng
                                                                        if (activity.type === 'initial_file') {
                                                                            handleDeleteAttachment(activity.originalIndex);
                                                                        } else if (activity.type === 'comment') {
                                                                            handleDeleteComment(activity.commentId);
                                                                        }
                                                                    }}
                                                                    style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#ef4444" }}
                                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
                                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* --- RENDER NỘI DUNG TÙY THEO LOẠI --- */}

                                                {/* 1. NẾU LÀ FILE ĐÍNH KÈM BAN ĐẦU */}
                                                {activity.type === 'initial_file' && (() => {
                                                    const isImg = activity.file.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                                    const fUrl = `http://localhost:5000/${activity.file}`;
                                                    return isImg ? (
                                                        <img src={fUrl} alt="attachment" style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #eee", marginTop: "4px" }} />
                                                    ) : (
                                                        <a href={fUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 16px", border: "1px solid #e5e7eb", borderRadius: "6px", textDecoration: "none", color: "#666", backgroundColor: "#fff", maxWidth: "100%", marginTop: "4px" }}>
                                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" flexShrink={0}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                            <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getOriginalFileName(activity.file)}</span>
                                                        </a>
                                                    );
                                                })()}

                                                {/* 2. NẾU LÀ COMMENT */}
                                                {activity.type === 'comment' && (
                                                    <>
                                                        {/* Chữ comment */}
                                                        {activity.text && (
                                                            <div style={{ fontSize: "14px", color: "#333", whiteSpace: "pre-wrap", lineHeight: "1.5", marginTop: "4px" }}>
                                                                {activity.text}
                                                            </div>
                                                        )}
                                                        {/* File của comment (nếu có) */}
                                                        {activity.files && activity.files.length > 0 && (
                                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: activity.text ? "10px" : "4px" }}>
                                                                {activity.files.map((file, fIdx) => {
                                                                    const isImg = file.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                                                                    const fUrl = `http://localhost:5000/${file}`;
                                                                    return isImg ? (
                                                                        <img key={fIdx} src={fUrl} alt="cmt-img" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #eee" }} />
                                                                    ) : (
                                                                        <a key={fIdx} href={fUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", textDecoration: "none", color: "#666", backgroundColor: "#f9fafb", fontSize: "12px", fontWeight: "500" }}>
                                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                                                            {getOriginalFileName(file)}
                                                                        </a>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div> {/* KẾT THÚC KHU VỰC CUỘN ĐƯỢC */}

                        {/* --- KHU VỰC GHIM CỐ ĐỊNH (Nhập Comment) --- */}
                        <div style={{ padding: "16px 32px", borderTop: "1px solid #ebebeb", backgroundColor: "#fff", flexShrink: 0 }}>

                            {/* KHU VỰC HIỂN THỊ TRƯỚC FILE ĐANG CHỌN (Preview) */}
                            {commentFiles.length > 0 && (
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", paddingLeft: "44px" }}>
                                    {Array.from(commentFiles).map((file, idx) => (
                                        <div key={idx} style={{ padding: "4px 10px", backgroundColor: "#f1f5f9", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", color: "#475569", display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                                            <span
                                                style={{ cursor: "pointer", color: "#ef4444", fontWeight: "bold", fontSize: "14px", lineHeight: "1" }}
                                                onClick={() => {
                                                    // Xóa file khỏi danh sách chờ gửi
                                                    const dt = new DataTransfer();
                                                    Array.from(commentFiles).filter((_, i) => i !== idx).forEach(f => dt.items.add(f));
                                                    setCommentFiles(dt.files);
                                                }}
                                                title="Gỡ file này"
                                            >×</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                {/* Avatar */}
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                                    U
                                </div>

                                {/* Ô nhập liệu bo tròn (Pill shape) */}
                                <div style={{ flex: 1, display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: "24px", padding: "10px 16px", backgroundColor: "#fff", transition: "border 0.2s" }} onFocus={(e) => e.currentTarget.style.border = "1px solid #3A924A"} onBlur={(e) => e.currentTarget.style.border = "1px solid #e5e7eb"}>

                                    <input
                                        type="text"
                                        placeholder="Comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCommentSubmit();
                                        }}
                                        style={{ border: "none", outline: "none", flex: 1, fontSize: "14px", color: "#333", backgroundColor: "transparent" }}
                                    />

                                    {/* THẺ INPUT FILE ẨN */}
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) setCommentFiles(e.target.files);
                                            // Reset value để có thể chọn lại cùng 1 file nếu lỡ tay xóa
                                            e.target.value = null;
                                        }}
                                    />

                                    {/* Icon kẹp ghim (Kích hoạt thẻ input ẩn) */}
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", padding: 0, transition: "color 0.2s" }}
                                        onMouseOver={(e) => e.currentTarget.style.color = "#3A924A"}
                                        onMouseOut={(e) => e.currentTarget.style.color = "#888"}
                                        title="Đính kèm tệp"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    </button>
                                </div>
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
        flex: 2,
        display: "flex",
        flexDirection: "column", // Ép thành cột từ trên xuống
        backgroundColor: "#fff",
        overflow: "hidden"
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