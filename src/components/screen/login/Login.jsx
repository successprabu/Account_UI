import React, { useState } from "react";
import "../../../App.css";
import { Link } from "react-router-dom";
import * as yup from 'yup';  // Corrected the import
import { loginSchema } from "../../../validations/ValidationSchema";


const Login = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    password: ''
  });
const [errors,serErrors]=useState({

})
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const userLogin = async (event) => {
    event.preventDefault();
    console.log(formData);
    const isValid= await loginSchema.isValid(formData)
  
  };

  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
      <div className="form_container p-5 rounded bg-white">
        <form onSubmit={userLogin}>
          <h3 className="text-center text-success">Sign In</h3>
          <div className="m2 text-primary">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              placeholder="Please Enter Your 10 Digits Mobile Number"
              className="form-control"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="m2 text-primary">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Please Enter Your Password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="m2">
            <input type="checkbox" className="custom-control custom-checkbox" id='check' />
            <label htmlFor='check' className='custom-input-label m-2'>Remember Me</label>
          </div>
          <div className="d-grid">
            <button className="btn btn-primary m-2">Sign In</button>
          </div>
          <p className="text-center">
             <a href="">Forgot Password</a><Link to="/purchase" className="m-2">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
