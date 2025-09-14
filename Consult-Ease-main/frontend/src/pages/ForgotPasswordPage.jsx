import {useState} from "react"
import { useAuthStore } from "../store/authStore";
import { Mail, Loader , ArrowLeft} from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {isLoading, forgotPassword, error} = useAuthStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
  
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending reset link:", error);
    }
  };
  return (<div className="container">
    <div style = {{padding : "2rem"}}>
        <h2 className="header-text">Forgot Password</h2>
        {!isSubmitted ? (
          <form onSubmit =  {handleSubmit} className="form-container">
            <p className="text">
            Enter your email address and we'll send you a link to reset your password.
            </p>
            <Input
                icon = {Mail}
                type = "text"
                placeholder = "Email Address"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}/>
            <button className="button-form" type = "submit" disabled = {isLoading}>
              {isLoading ? <Loader className='spinner' size={24} /> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="animated-icon-container">
                <Mail className="animated-icon" />
            </div>
            <p className="text">
                If an account exists for {email}, you will receive a password reset link shortly.
            </p>
        </div>
        )}
    </div>
    {error &&<p className="error-text">{error}</p>}
    <div className="footer-container-1">
        <Link to={"/login"} className="link">
            <ArrowLeft className="icon" /> Back to Login
        </Link>
    </div>
  </div>)
}

export default ForgotPasswordPage;