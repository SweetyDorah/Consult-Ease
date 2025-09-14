import "./pageStyles.css"
import {User, Lock, Mail, Building, Phone, Loader} from "lucide-react"
import {Link, useNavigate} from "react-router-dom"
import Input from "../components/Input"
import { useState } from "react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {

  const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();
	const {signup, error, isLoading} = useAuthStore();

  const handleSignup = async(e) => {
      e.preventDefault();
      console.log({ email, password, name, department, mobile });
      try {
        await signup(email, password, name, department, mobile);
        navigate("/verify-email")
      }catch(error){
          console.log(error)
      }
  };
  return (
    <div className = "container">
      <div style = {{padding: "1rem"}}>
        <h2 className="header-text">ConsultEase</h2>
        <p className="header-subtext">CREATE YOUR ACCOUNT</p>
      </div>
      <div>
      <form onSubmit={handleSignup} >
        <div className="form-container">
        <Input
						icon={User}
						type='text'
						placeholder='Full Name'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<Input
						icon={Mail}
						type='email'
						placeholder='Email Address'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Input
						icon={Lock}
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
          <Input
						icon={Building}
						type='text'
						placeholder='Department'
						value={department}
						onChange={(e) => setDepartment(e.target.value)}
					/>
          <Input
						icon={Phone}
						type='text'
						placeholder='Mobile Number'
						value={mobile}
						onChange={(e) => setMobile(e.target.value)}
					/>
        {error &&<p className="error-text">{error}</p>}
        <PasswordStrengthMeter password= {password}/>
        </div>
        <button className="button-form" type = "submit" disabled = {isLoading}>
        {isLoading ? <Loader className='spinner' size={24} /> : "Sign Up"}
        </button>
      </form>
      </div>
      <div className="footer-container">
        <p className="footer-text">Already have an Account? {" "}
          <Link className = "footer-link" to = "/login"> Login </Link>
        </p>
      </div>

    </div>
  )
}

export default SignUpPage