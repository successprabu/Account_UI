import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');  // Redirect to the login page
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
  );
};

export default Logout;
