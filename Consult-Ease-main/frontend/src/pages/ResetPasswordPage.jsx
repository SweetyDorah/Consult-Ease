import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Input from "../components/Input";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { resetPassword, error, isLoading } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await resetPassword(token, password);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div style={{ padding: "1rem" }}>
        <h2 className="header-text"> Reset Password</h2>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div style = {{display : "flex", justifyContent : "center"}}>
            <PasswordStrengthMeter password={password}/>
          </div>
          
          {error && <p className="error-text">{error}</p>}
          <button className="button-form" type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
