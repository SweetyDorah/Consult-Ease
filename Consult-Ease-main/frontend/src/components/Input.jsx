import { useState } from "react";
import "./componentStyles.css";
import { Eye, EyeOff, Lock } from "lucide-react"; 

const Input = ({ icon: Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = Icon === Lock;

  const handleToggle = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="input-container">
      <div className="input-icon">
        <Icon className="icon" />
      </div>

      <input
        {...props}
        type={isPasswordInput ? (showPassword ? "text" : "password") : type}
        className="input-field"
      />

      {isPasswordInput && (
        <div className="input-icon toggle-icon" onClick={handleToggle}>
          {showPassword ? <Eye className="icon" /> : <EyeOff className="icon" />}
        </div>
      )}
    </div>
  );
};

export default Input;
