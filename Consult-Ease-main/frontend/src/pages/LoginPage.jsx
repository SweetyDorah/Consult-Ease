import { useState, useEffect } from "react";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, replace, useNavigate } from "react-router-dom";
import "./pageStyles.css";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, user } = useAuthStore(); // now watch user
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user || !user.email) return;
  
    const role = user.email === "admin@example.com" ? "admin" : "faculty";
    if (role === "admin") {
      navigate("/admin-dashboard", replace);
    } else {
      navigate("/faculty-dashboard", replace);
    }
  }, [user, navigate]);

  return (
    <div className="container">
      <div style={{ padding: "1rem" }}>
        <h2 className="header-text">ConsultEase</h2>
        <p className="header-subtext">WELCOME BACK!</p>
      </div>
      <div>
        <form onSubmit={handleLogin}>
          <div className="form-container">
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="forgot-container">
            <Link to="/forgot-password" className="forgot-text">
              Forgot password?
            </Link>
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="button-form" type="submit" disabled={isLoading}>
            {isLoading ? <Loader className="spinner" size={24} /> : "Login"}
          </button>
        </form>
      </div>
      <div className="footer-container">
        <p className="footer-text">
          Don't have an Account?{" "}
          <Link className="footer-link" to="/signup">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
