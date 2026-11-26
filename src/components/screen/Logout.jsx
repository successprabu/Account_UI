import { useNavigate } from "react-router-dom";
import { signOut } from "../../utils/session";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');  // Redirect to the login page
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
  );
};

export default Logout;
