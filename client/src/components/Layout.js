import { Outlet, Link } from "react-router-dom";

function Layout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const styles = {
    layout: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh", // Đảm bảo chiếm toàn bộ chiều cao màn hình
    },
    header: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    logo: {
      margin: 0,
      fontSize: "24px",
      fontWeight: "bold",
    },
    logoutBtn: {
      backgroundColor: "#ff4d4f",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    mainContent: {
      flex: 1, // Phần này sẽ tự động giãn ra chiếm hết khoảng trống ở giữa
      padding: "20px",
      backgroundColor: "#f4f7f6",
    },
    footer: {
      backgroundColor: "#333",
      color: "white",
      textAlign: "center",
      padding: "10px",
      fontSize: "14px",
    }
  };

  return (
    <div style={styles.layout}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <h1 style={styles.logo}>Task Manager</h1>
        <div>
          {/* Bạn có thể thêm các Link điều hướng ở đây */}
          <button style={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
        </div>
      </header>

      {/* --- PHẦN NHÚNG NỘI DUNG (MAIN) --- */}
      <main style={styles.mainContent}>
        {/* TẤT CẢ các trang con sẽ được render vào vị trí của thẻ Outlet này */}
        <Outlet /> 
      </main>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <p>&copy; 2026 Hệ thống quản lý công việc. Đã đăng ký bản quyền.</p>
      </footer>
    </div>
  );
}

export default Layout;