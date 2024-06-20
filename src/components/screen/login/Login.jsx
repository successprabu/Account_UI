import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../App.css";
import { Link } from "react-router-dom";
import * as yup from 'yup';
import { loginSchema } from "../../../validations/ValidationSchema";
import { LOGIN_API } from "../../common/CommonApiURL";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const userLogin = async (event) => {
    event.preventDefault();

    try {
      console.log(formData, 'fromdata');
      const isValid = await loginSchema.isValid(formData);
      console.log(isValid)
      if (isValid) {
        // Axios post request
        const response = await axios.post(LOGIN_API, formData);
        const data = response.data;
        
        if (data.result) {
          localStorage.setItem('user', JSON.stringify(data.data));
          navigate('/dashboard');  // Change to your dashboard route
        } else {
          setLoginError(data.message);
        }
      } else {
        setErrors({ validation: "Please Enter Username & Password" });
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary  ">
      <div className="form_container p-5 rounded bg-white">
        <form onSubmit={userLogin}>
          <h3 className="text-center text-success">Sign In</h3>
          {loginError && <p className="text-danger">{loginError}</p>}
          {errors.validation && <p className="text-danger">{errors.validation}</p>}
          <div className="m2 text-primary">
            <label htmlFor="username">Mobile Number</label>
            <input
              type="text"
              name="username"
              placeholder="Please Enter Your 10 Digits Mobile Number"
              className="form-control"
              value={formData.username}
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
