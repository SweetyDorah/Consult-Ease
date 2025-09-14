import { ArrowLeft} from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {

  return (<div className="container">
    <div style = {{padding : "2rem"}}>
        <h1 className="home-text">ConsultEase</h1>
        <p className="home-subtext"> Streamlining Consultancy Projects, Simplifying Success!</p>

    
    </div>
    <div style = {{display : "flex"}}>
    <Link to={"/login"} className="button-form-1">Get Started</Link>

    </div>
    
  </div>)
}

export default HomePage;