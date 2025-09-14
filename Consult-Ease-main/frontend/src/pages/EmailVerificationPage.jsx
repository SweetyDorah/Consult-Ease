import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./pageStyles.css"
import { useAuthStore } from "../store/authStore";

const EmailVerificationPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const {error, isLoading, verifyEmail} = useAuthStore();
    const handleSubmit = async (e) => {
      e.preventDefault();
      const verificationCode = code.join("");
      try {
        await verifyEmail(verificationCode);
        console.log("Verification successful. Navigating to home...");
        
      } catch(error){
        console.log(error)
      }
      
    }

    useEffect(() => {
      if (code.every((digit) => digit !== "")) {
        handleSubmit({ preventDefault: () => {} }); 
        navigate("/");
      }
    }, [code]);

    const handleChange = (index, value) => {
      const newCode = [...code];
  
      if (value.length > 1) {
        const pastedCode = value.slice(0, 6).split("");
        for (let i = 0; i < 6; i++) {
          newCode[i] = pastedCode[i] || "";
        }
        setCode(newCode);

        const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
        const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
        inputRefs.current[focusIndex].focus();
      } else {
        newCode[index] = value;
        setCode(newCode);
  
        if (value && index < 5) {
          inputRefs.current[index + 1].focus();
        }
      }
    };
  
    const handleKeyDown = (index, e) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    };

    return (<div className = "container">
      <div style={{padding: "1rem"}}>
        <h2 className="header-text">Verify Your Account</h2>
        <p className="header-subtext">Enter the 6-digit code sent to your email address.</p>

      <form onSubmit = {handleSubmit} style = {{paddingTop: "1.5rem", paddingBottom: "1.5rem"}}>
      <div className='verify-form'>
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type='text'
								maxLength='6'
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className='verify-input'
							/>
						))}
					</div>
          {error &&<p className="error-text">{error}</p>}
          <button className="button-form" type = "submit" disabled = {isLoading}>
            {isLoading ? "Verifying..." : "Sign Up"}
          </button>
      </form>
      </div>
    </div>)
}

export default EmailVerificationPage;