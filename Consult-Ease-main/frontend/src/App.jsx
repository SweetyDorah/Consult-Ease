import "./App.css";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import FacultyDashboard from "./pages/FacultyDashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectForm from "./pages/ProjectForm"; 
import StatisticsPage from "./pages/StatisticsPage";
import ProjectDisplay from "./pages/ProjectDisplay";
import GenerateReport from "./pages/GenerateReport";

import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import EditForm from "./pages/EditForm";

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user.isVerified) {
    return <Navigate to={user?.email === 'admin@example.com' ? '/admin-dashboard' : '/faculty-dashboard'} replace />;
  }
  return children;
};

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="background">
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoutes>
              <FacultyDashboard />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoutes>
              <AdminDashboard />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/new-form"
          element={
            <ProtectedRoutes>
              <ProjectForm />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/edit-project/:id"
          element={
            <ProtectedRoutes>
              <EditForm />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/generate-report"
          element={
            <ProtectedRoutes>
              <GenerateReport />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/view-statistics"
          element={
            <ProtectedRoutes>
              <StatisticsPage />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/project-info"
          element={
            <ProtectedRoutes>
              <ProjectDisplay />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
