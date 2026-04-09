import { Link } from "react-router-dom";

function LandingPage() {
  const styles = {
    wrapper: {
      padding: "80px 20px",
      backgroundColor: "#ffffff",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "50px",
      flexWrap: "wrap", // Giúp các cột tự động rớt dòng trên màn hình điện thoại
    },
    textSection: {
      flex: "1 1 500px",
      textAlign: "left",
    },
    heading: {
      fontSize: "52px",
      fontWeight: "800",
      color: "#202020",
      lineHeight: "1.1",
      marginBottom: "24px",
      letterSpacing: "-1.5px",
    },
    subHeading: {
      fontSize: "20px",
      color: "#666",
      lineHeight: "1.6",
      marginBottom: "40px",
      maxWidth: "480px",
    },
    ctaButton: {
      backgroundColor: "#3A924A", // Đã đổi sang tông xanh của bạn
      color: "white",
      padding: "16px 32px",
      fontSize: "18px",
      fontWeight: "600",
      textDecoration: "none",
      borderRadius: "8px",
      display: "inline-block",
      transition: "all 0.2s ease-in-out",
      boxShadow: "0 4px 14px rgba(58, 146, 74, 0.3)", // Đổ bóng nhẹ màu xanh
    },
    statsContainer: {
      display: "flex",
      gap: "40px",
      marginTop: "50px",
      paddingTop: "30px",
      borderTop: "1px solid #eee",
    },
    statItem: {
      display: "flex",
      flexDirection: "column",
    },
    statNumber: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#202020",
      letterSpacing: "-1px",
    },
    statLabel: {
      fontSize: "15px",
      color: "#666",
      marginTop: "4px",
    },
    imageSection: {
      flex: "1 1 400px",
      display: "flex",
      justifyContent: "center",
      position: "relative",
    },
    heroImage: {
      width: "100%",
      maxWidth: "550px",
      borderRadius: "16px",
      boxShadow: "0 24px 48px rgba(0, 0, 0, 0.12)", // Hiệu ứng nổi lên cho ảnh
      border: "1px solid #f0f0f0",
      objectFit: "cover",
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        
        {/* --- CỘT TRÁI: Nội dung --- */}
        <div style={styles.textSection}>
          <h1 style={styles.heading}>Sắp xếp công việc và cuộc sống, thật dễ dàng.</h1>
          <p style={styles.subHeading}>
            Trở nên tập trung, tổ chức và bình tĩnh hơn với VHTask. Giải phóng tâm trí của bạn ngay hôm nay để đạt hiệu suất cao nhất.
          </p>
          
          <Link 
            to="/register" 
            style={styles.ctaButton}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#2C7339"; // Xanh đậm hơn khi di chuột vào
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#3A924A";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Bắt đầu miễn phí
          </Link>

          {/* Các con số thống kê tạo sự tin tưởng */}
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>1M+</span>
              <span style={styles.statLabel}>Người dùng</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>15M+</span>
              <span style={styles.statLabel}>Task hoàn thành</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>4.9/5</span>
              <span style={styles.statLabel}>Đánh giá</span>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: Hình ảnh minh họa --- */}
        <div style={styles.imageSection}>
          <img 
            // Bạn có thể thay thế đường link này bằng "/images/dashboard.png" 
            // sau khi bạn chụp màn hình ứng dụng thật của bạn và bỏ vào thư mục public/images
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80" 
            alt="VHTask Workspace" 
            style={styles.heroImage}
          />
        </div>

      </div>
    </div>
  );
}

export default LandingPage;