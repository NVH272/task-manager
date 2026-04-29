import React from "react";

function TaskAddForm({
    title, setTitle,
    description, setDescription,
    setAttachments,
    deadline, setDeadline,
    priority, setPriority,
    isAdding, setIsAdding,
    addTask,
    styles
}) {
    // 1. NẾU KHÔNG BẬT FORM THÊM -> HIỆN NÚT "ADD TASK"
    if (!isAdding) {
        return (
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
        );
    }

    // 2. NẾU ĐÃ BẬT -> HIỆN KHỐI FORM NHẬP LIỆU
    return (
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
    );
}

export default TaskAddForm;