import { FileBarChart, BarChartBig, FolderOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./pageStyles.css";
import { useAuthStore } from "../store/authStore";

const AdminDashboard = () => {
    const {logout } = useAuthStore();
    const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };


  return (
    <div className="container">
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <h2 className="header-text">ConsultEase </h2>
        <p className="header-subtext">ADMIN DASHBOARD</p>
      </div>

      <div className="dashboard-icon-grid">
        <div className="dashboard-icon-column">
          <div className="icon-container">
            <FileBarChart size={96} color="white" />
          </div>
          <button
            className="button-form"
            onClick={() => navigate("/generate-report")}
          >
            Generate Report
          </button>
        </div>

        <div className="dashboard-icon-column">
          <div className="icon-container">
            <BarChartBig size={96} color="white" />
          </div>
          <button
            className="button-form"
            onClick={() => navigate("/view-statistics")}
          >
            View Statistics
          </button>
        </div>

        <div className="dashboard-icon-column">
          <div className="icon-container">
            <FolderOpen size={96} color="white" />
          </div>
          <button
            className="button-form"
            onClick={() => navigate("/project-info")}
          >
            Project Info
          </button>
        </div>
      </div>
      <div>
      <div style={{ marginTop: "2rem" }}>
          <button onClick={handleLogout} className="redirect-button">
            <LogOut size={24} color="#F5A425" style={{ marginRight: "8px" }} />
            Logout
          </button>
        </div>
    </div>
    </div>
    
  );
};

export default AdminDashboard;