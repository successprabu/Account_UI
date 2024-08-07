import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../App.css";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { loginSchema } from "../../../validations/ValidationSchema";
import { LOGIN_API } from "../../common/CommonApiURL";
import axios from "axios";
import { ClipLoader } from 'react-spinners';  // Importing a loader from react-spinners

const OldLogin = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType:'AU'
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);  // Loading state
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
    setLoading(true);  // Start loading

    try {
      const isValid = await loginSchema.isValid(formData);
      if (isValid) {
        // Axios post request
        const response = await axios.post(LOGIN_API, formData);
        const data = response.data;
        console.log(data.message);

        if (data.result) {
          localStorage.setItem('user', JSON.stringify(data.data));
          navigate('/dashboard');  // Change to your dashboard route
        } else {
          setLoginError(data.message);
        }
      } else {
        setErrors({ validation: t("please_enter_username_password") });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError(t("an_error_occurred"));
      }
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
      <div className="form_container p-5 rounded bg-white">
        <form onSubmit={userLogin}>
          <h3 className="text-center text-success">{t("sign_in")}</h3>
          {loginError && <p className="text-danger">{loginError}</p>}
          {errors.validation && <p className="text-danger">{errors.validation}</p>}
          <div className="m2 text-primary">
            <label htmlFor="username">{t("mobile_number")}</label>
            <input
              type="text"
              name="username"
              placeholder={t("enter_mobile_number")}
              className="form-control"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="m2 text-primary">
            <label htmlFor="password">{t("password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("enter_password")}
              className="form-control"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="m2">
            <input type="checkbox" className="custom-control custom-checkbox" id='check' />
            <label htmlFor='check' className='custom-input-label m-2'>{t("remember_me")}</label>
          </div>
          <div className="d-grid">
            <button className="btn btn-primary m-2" disabled={loading}>
              {loading ? <ClipLoader size={20} color={"#ffffff"} /> : t("sign_in")}
            </button>
          </div>
          <p className="text-center">
            <a href="">{t("forgot_password")}</a><Link to="/purchase" className="m-2">{t("sign_up")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default OldLogin;
