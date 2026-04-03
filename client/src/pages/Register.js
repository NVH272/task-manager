import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await API.post("/auth/register", { name, email, password });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  // --- STYLE OBJECTS (Giao diện) ---
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f4f7f6", // Màu nền xám nhạt hiện đại
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      backgroundColor: "#ffffff",
      padding: "40px",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Đổ bóng nhẹ
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
      boxSizing: "border-box", // Giúp input không bị tràn viền
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
        <h2 style={styles.title}>Tạo Tài Khoản</h2>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        
        <div style={styles.inputGroup}>
          <input 
            placeholder="Họ và tên" 
            value={name}
            onChange={e => setName(e.target.value)} 
            style={styles.input}
          />
        </div>

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

        <div style={styles.inputGroup}>
          <input 
            type="password" 
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} 
            style={styles.input}
          />
        </div>

        <button 
          onClick={handleRegister} 
          style={styles.button}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Đăng Ký
        </button>
        
        <p style={styles.linkText}>
          Đã có tài khoản? <Link style={styles.link} to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;