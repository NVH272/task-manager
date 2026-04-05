import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  // --- STYLE OBJECTS (Đồng bộ với Register) ---
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f4f7f6",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      width: "100%",
      maxWidth: "400px",
      textAlign: "center"
    },
    title: {
      marginBottom: "20px",
      color: "#333",
      fontSize: "24px"
    },
    errorBox: {
      backgroundColor: "#ffe6e6",
      color: "#d9534f",
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "15px",
      fontSize: "14px",
      fontWeight: "500"
    },
    inputGroup: {
      marginBottom: "15px",
      textAlign: "left"
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none"
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "10px",
      transition: "background-color 0.3s"
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "20px 0"
    },
    line: {
      flex: 1,
      height: "1px",
      backgroundColor: "#ddd"
    },
    dividerText: {
      margin: "0 10px",
      color: "#888",
      fontSize: "14px"
    },
    googleButton: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#fff",
      color: "#333",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      transition: "background-color 0.3s"
    },
    linkText: {
      marginTop: "20px",
      fontSize: "14px",
      color: "#666"
    },
    link: {
      color: "#007bff",
      textDecoration: "none",
      fontWeight: "bold"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Đăng Nhập</h2>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        
        <div style={styles.inputGroup}>
          <input 
            placeholder="Địa chỉ Email" 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)} 
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <input 
            type="password" 
            placeholder="Mật khẩu"
            value={password}
            onChange={e => setPassword(e.target.value)} 
            style={styles.input}
          />
        </div>

        <button 
          onClick={handleLogin} 
          style={styles.button}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Đăng Nhập
        </button>

        {/* --- Dòng kẻ phân cách --- */}
        <div style={styles.divider}>
          <div style={styles.line}></div>
          <span style={styles.dividerText}>Hoặc</span>
          <div style={styles.line}></div>
        </div>

        {/* --- Nút Google với Logo SVG --- */}
        <button 
          onClick={loginWithGoogle} 
          style={styles.googleButton}
          onMouseOver={(e) => e.target.style.backgroundColor = "#f9f9f9"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#fff"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Đăng nhập bằng Google
        </button>
        
        <p style={styles.linkText}>
          Chưa có tài khoản? <Link style={styles.link} to="/register">Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;