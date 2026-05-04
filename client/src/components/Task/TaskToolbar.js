import React, { useState } from "react";

function TaskToolbar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
    // State để theo dõi xem người dùng có đang click vào ô nào không (để làm hiệu ứng viền xanh)
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSelectFocused, setIsSelectFocused] = useState(false);

    return (
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "550px", alignItems: "center" }}>

            {/* --- Ô TÌM KIẾM --- */}
            <div style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: isSearchFocused ? "#ffffff" : "#f8fafc", // Sáng lên khi click
                border: `1px solid ${isSearchFocused ? "#3A924A" : "#e2e8f0"}`,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                boxShadow: isSearchFocused ? "0 0 0 3px rgba(58, 146, 74, 0.15)" : "none" // Đổ bóng xanh lá nhẹ
            }}>
                {/* Icon Kính Lúp */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSearchFocused ? "#3A924A" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", transition: "stroke 0.2s" }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>

                <input
                    type="text"
                    placeholder="Tìm kiếm công việc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    style={{
                        width: "100%", border: "none", outline: "none", backgroundColor: "transparent",
                        padding: "10px 12px 10px 36px", // Căn lề trái để nhường chỗ cho Kính lúp
                        fontSize: "14px", color: "#334155", fontFamily: "inherit"
                    }}
                />
            </div>

            {/* --- Ô SẮP XẾP (FILTER) --- */}
            <div style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                backgroundColor: isSelectFocused ? "#ffffff" : "#f8fafc",
                border: `1px solid ${isSelectFocused ? "#3A924A" : "#e2e8f0"}`,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                boxShadow: isSelectFocused ? "0 0 0 3px rgba(58, 146, 74, 0.15)" : "none"
            }}>
                {/* Icon Bộ Lọc (Filter) */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isSelectFocused ? "#3A924A" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", pointerEvents: "none", transition: "stroke 0.2s" }}>
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    onFocus={() => setIsSelectFocused(true)}
                    onBlur={() => setIsSelectFocused(false)}
                    style={{
                        appearance: "none", // Code "phép thuật" để ẩn mũi tên mặc định của thẻ select
                        WebkitAppearance: "none",
                        padding: "10px 32px 10px 34px",
                        border: "none", outline: "none", backgroundColor: "transparent",
                        cursor: "pointer", fontSize: "14px", color: "#334155",
                        fontWeight: "500", fontFamily: "inherit", width: "100%"
                    }}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="priority">Ưu tiên cao</option>
                    <option value="deadline">Hạn chót</option>
                </select>

                {/* Mũi tên Dropdown tự thiết kế */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "10px", pointerEvents: "none" }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

        </div>
    );
}

export default TaskToolbar;