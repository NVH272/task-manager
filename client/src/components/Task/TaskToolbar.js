import React from "react";
function TaskToolbar({ searchQuery, setSearchQuery, sortBy, setSortBy, styles }) {
    return (
        < div style={{ display: "flex", gap: "10px", marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #eee" }
        }>
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
        </div >
    );
}

export default TaskToolbar;