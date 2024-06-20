import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedAccess = () => {
  return (
    <div>
      <p>You have to login first. Click <Link to="/login">here</Link> to login.</p>
    </div>
  );
};

export default UnauthorizedAccess;
