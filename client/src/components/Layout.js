import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import TaskToolbar from "../components/Task/TaskToolbar";

function Layout() {
  const location = useLocation();
  const isTaskPage = location.pathname === "/tasks";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Kiểm tra xem có token trong máy không
  const isLoggedIn = !!localStorage.getItem("token");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu click xảy ra bên ngoài vùng chứa dropdown -> đóng lại
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- STYLE OBJECTS ---
  const styles = {
    layout: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: "#202020",
    },
    // --- HEADER STYLES ---
    header: {
      backgroundColor: "#ffffff",
      padding: "12px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #f0f0f0",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      textDecoration: "none",
      cursor: "pointer",
    },
    logoText: {
      margin: 0,
      fontSize: "20px",
      fontWeight: "700",
      color: "#3A924A", // Đã đổi sang màu xanh
      letterSpacing: "-0.5px",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "24px",
      fontSize: "15px",
      fontWeight: "500",
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      cursor: "pointer",
      color: "#202020",
    },
    divider: {
      height: "24px",
      width: "1px",
      backgroundColor: "#e5e5e5",
    },
    navLink: {
      color: "#202020",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: "500",
    },
    primaryBtn: {
      backgroundColor: "#3A924A", // Đã đổi sang màu xanh
      color: "white",
      textDecoration: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      fontWeight: "600",
      fontSize: "15px",
      transition: "opacity 0.2s", // Thêm hiệu ứng mượt khi hover
    },
    logoutBtn: {
      backgroundColor: "transparent",
      color: "#202020",
      border: "none",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      padding: 0,
    },
    // --- MAIN CONTENT ---
    mainContent: {
      flex: 1,
      padding: "40px",
      backgroundColor: "#ffffff",
    },
    // --- FOOTER STYLES ---
    footer: {
      backgroundColor: "#F4F7F5", // Mình chỉnh màu nền Footer sang tông hơi xanh lục nhạt một xíu cho hợp với logo
      padding: "60px 40px 30px 40px",
      fontSize: "14px",
    },
    footerTop: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "60px",
      flexWrap: "wrap",
      gap: "40px",
    },
    footerBrand: {
      maxWidth: "300px",
    },
    brandDesc: {
      marginTop: "16px",
      lineHeight: "1.6",
      color: "#202020",
      fontSize: "15px",
    },
    footerGrid: {
      display: "flex",
      gap: "80px",
    },
    footerCol: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    colTitle: {
      fontWeight: "600",
      color: "#202020",
      marginBottom: "4px",
    },
    footerLink: {
      color: "#202020",
      textDecoration: "none",
      cursor: "pointer",
    },
    socialGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      alignItems: "flex-end",
    },
    footerBottom: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "#666",
      fontSize: "13px",
    },
    legalLinks: {
      display: "flex",
      gap: "10px",
    },
    avatarContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    avatarImg: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      cursor: "pointer",
      objectFit: "cover",
      border: "2px solid #e5e5e5", // Viền xám nhạt nhẹ nhàng
    },
    dropdownMenu: {
      position: "absolute",
      top: "48px", // Cách avatar một chút
      right: "0",
      backgroundColor: "#ffffff",
      border: "1px solid #f0f0f0",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // Đổ bóng mờ phong cách SaaS
      width: "160px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 100, // Đảm bảo menu luôn đè lên các nội dung bên dưới
    },
    dropdownItem: {
      padding: "12px 16px",
      cursor: "pointer",
      color: "#202020",
      fontSize: "14px",
      fontWeight: "500",
      textDecoration: "none",
      backgroundColor: "transparent",
      border: "none",
      textAlign: "left",
      width: "100%",
    },
    dropdownDivider: {
      height: "1px",
      backgroundColor: "#f0f0f0",
      margin: "0",
    },
  };

  return (
    <div style={styles.layout}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        {/* CỘT TRÁI: LOGO */}
        <Link to="/" style={styles.headerLeft}>
          <img src="/images/logo.png" alt="VHTask Logo" style={{ width: "28px", height: "28px", borderRadius: "6px" }} />
          <h1 style={styles.logoText}>VHTask</h1>
        </Link>

        {/* 4. CỘT GIỮA: TOOLBAR TÌM KIẾM (Chỉ hiện khi đã đăng nhập và đang mở trang My Tasks) */}
        {isLoggedIn && isTaskPage && (
          <div style={styles.headerCenter}>
            <TaskToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
        )}

        {/* CỘT PHẢI: NAV/AVATAR */}
        <nav style={styles.headerRight}>
          <div style={styles.divider}></div>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={styles.navLink}>Log in</Link>
              <Link to="/register" style={styles.primaryBtn} onMouseOver={(e) => e.target.style.opacity = "0.85"} onMouseOut={(e) => e.target.style.opacity = "1"}>Start for free</Link>
            </>
          ) : (
            <>
              <Link to="/tasks" style={styles.navLink}>My Tasks</Link>
              <div style={styles.avatarContainer} ref={dropdownRef}>
                <img src="https://via.placeholder.com/150" alt="Avatar" style={styles.avatarImg} onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                {isDropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <Link to="/account" style={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>Account</Link>
                    <div style={styles.dropdownDivider}></div>
                    <button style={{ ...styles.dropdownItem, color: "#d93025" }} onClick={() => { setIsDropdownOpen(false); handleLogout(); }}>Log out</button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </header>

      {/* --- PHẦN NHÚNG NỘI DUNG (MAIN) --- */}
      <main style={styles.mainContent}>
        <Outlet context={{ searchQuery, sortBy }} />
      </main>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src="/images/logo.png"
                alt="VHTask Logo"
                style={{ width: "24px", height: "24px", borderRadius: "6px" }}
              />
              <span style={{ fontSize: "18px", fontWeight: "700", color: "#202020", letterSpacing: "-0.5px" }}>VHTask</span>
            </div>
            <p style={styles.brandDesc}>
              Join millions of people who organize work and life with VHTask.
            </p>
          </div>

          <div style={styles.footerGrid}>
            <div style={styles.footerCol}>
              <span style={styles.colTitle}>Features</span>
              <span style={styles.footerLink}>How It Works</span>
              <span style={styles.footerLink}>For Teams</span>
              <span style={styles.footerLink}>Templates</span>
            </div>

            <div style={styles.footerCol}>
              <span style={styles.colTitle}>Resources</span>
              <span style={styles.footerLink}>Download Apps</span>
              <span style={styles.footerLink}>Help Center</span>
              <span style={styles.footerLink}>Productivity Methods</span>
              <span style={styles.footerLink}>Integrations</span>
            </div>

            <div style={styles.footerCol}>
              <span style={styles.colTitle}>Company</span>
              <span style={styles.footerLink}>About Us</span>
              <span style={styles.footerLink}>Careers</span>
              <span style={styles.footerLink}>Press</span>
            </div>
          </div>

          <div style={styles.socialGroup}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.6 2.6 0 0 0-1.838-1.851C18.122 3.9 12 3.9 12 3.9s-6.122 0-7.744.435a2.6 2.6 0 0 0-1.838 1.851C2 7.828 2 12 2 12s0 4.172.418 5.814a2.6 2.6 0 0 0 1.838 1.851C5.878 20.1 12 20.1 12 20.1s6.122 0 7.744-.435a2.6 2.6 0 0 0 1.838-1.851C22 16.172 22 12 22 12s0-4.172-.418-5.814zM9.995 15.59v-7.18l6.494 3.59-6.494 3.59z" /></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <div style={styles.legalLinks}>
            <span>Security</span>
            <span>|</span>
            <span>Privacy</span>
            <span>|</span>
            <span>Terms</span>
          </div>
          <div>© 2026 VHTask Inc.</div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;