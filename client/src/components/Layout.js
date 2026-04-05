import { Outlet, Link } from "react-router-dom";

function Layout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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
      borderBottom: "1px solid #f0f0f0", // Viền mỏng dưới header thay cho đổ bóng
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
      color: "#E44332", // Màu đỏ đặc trưng
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
      backgroundColor: "#FFF9F5", // Màu nền be nhạt
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
    }
  };

  return (
    <div style={styles.layout}>
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Logo SVG mô phỏng Todoist */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="6" fill="#E44332"/>
            <path d="M7 11.5L10.5 15L17 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 16.5L10.5 20L17 13.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 6.5L10.5 10L17 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={styles.logoText}>VHTask</h1>
        </div>
        
        <nav style={styles.headerRight}>
          <span style={styles.navItem}>
            Made For
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
          <span style={styles.navItem}>
            Resources
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </span>
          <div style={styles.divider}></div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log out</button>
        </nav>
      </header>

      {/* --- PHẦN NHÚNG NỘI DUNG (MAIN) --- */}
      <main style={styles.mainContent}>
        <Outlet /> 
      </main>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.footerTop}>
          <div style={styles.footerBrand}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="5" fill="#202020"/>
                <path d="M6 10.5L9.5 14L16 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 15.5L9.5 19L16 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 5.5L9.5 9L16 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
            {/* YouTube Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 6.186a2.6 2.6 0 0 0-1.838-1.851C18.122 3.9 12 3.9 12 3.9s-6.122 0-7.744.435a2.6 2.6 0 0 0-1.838 1.851C2 7.828 2 12 2 12s0 4.172.418 5.814a2.6 2.6 0 0 0 1.838 1.851C5.878 20.1 12 20.1 12 20.1s6.122 0 7.744-.435a2.6 2.6 0 0 0 1.838-1.851C22 16.172 22 12 22 12s0-4.172-.418-5.814zM9.995 15.59v-7.18l6.494 3.59-6.494 3.59z"/></svg>
            {/* LinkedIn Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            {/* Instagram Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
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