import { Check, X } from "lucide-react";
import './componentStyles.css'; 

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="password-criteria">
      {criteria.map((item) => (
        <div key={item.label} className="password-criteria-item">
          {item.met ? (
            <Check className="criteria-icon criteria-icon-met" />
          ) : (
            <X className="criteria-icon criteria-icon-not-met" />
          )}
          <span
            className={
              item.met
                ? "password-criteria-item-met"
                : "password-criteria-item-not-met"
            }
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };
  const strength = getStrength(password);

  const getColor = (strength) => {
    if (strength === 0) return "meter-very-weak";
    if (strength === 1) return "meter-weak";
    if (strength === 2) return "meter-fair";
    if (strength === 3) return "meter-good";
    return "meter-strong";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="password-strength-container">
      <div className="password-strength-header">
        <span className="password-strength-header-text">Password strength</span>
        <span className="password-strength-header-text">{getStrengthText(strength)}</span>
      </div>

      <div className="password-strength-meter">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`password-strength-meter-bar ${index < strength ? getColor(strength) : "meter-inactive"}`}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;