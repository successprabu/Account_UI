import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../App.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginSchema } from "../../../validations/ValidationSchema";
import {
  LOGIN_API,
  LOGIN_USER_ACCOUNT_CHECK_API,
} from "../../common/CommonApiURL";
import axios from "axios";
import { ClipLoader } from "react-spinners"; // Importing a loader from react-spinners
import AppHeader from "../../common/AppHeader";

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "AU",
    userTypeDescription: "",
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [userTypes, setUserTypes] = useState([]); // User types state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUsernameBlur = async () => {
    try {
      //const response = await axios.get(`http://localhost/api/Auth/UserAccountCheck?userName=${formData.username}&appName=MOI`);
      const response = await axios.get(
        `${LOGIN_USER_ACCOUNT_CHECK_API}userName=${formData.username}&appName=MOI`
      );
      const data = response.data;
      if (data.result && data.data.length > 0) {
        const uniqueUserTypes = [
          ...new Set(data.data.map((item) => item.userType)),
        ];
        const userTypesWithDescriptions = uniqueUserTypes.map((userType) => {
          const userTypeInfo = data.data.find(
            (item) => item.userType === userType
          );
          return {
            userType: userTypeInfo.userType,
            userTypeDescription: userTypeInfo.userTypeDescription,
          };
        });

        if (uniqueUserTypes.length === 1) {
          setFormData({
            ...formData,
            userType: userTypesWithDescriptions[0].userType,
            userTypeDescription:
              userTypesWithDescriptions[0].userTypeDescription,
          });
          setUserTypes([]);
        } else {
          setUserTypes(userTypesWithDescriptions);
        }
      } else {
        setLoginError(t("no_user_found"));
        setUserTypes([]);
      }
    } catch (error) {
      setLoginError(t("an_error_occurred"));
      setUserTypes([]);
    }
  };

  const handleUserTypeChange = (e) => {
    const selectedUserType = userTypes.find(
      (type) => type.userType === e.target.value
    );
    setFormData({
      ...formData,
      userType: selectedUserType.userType,
      userTypeDescription: selectedUserType.userTypeDescription,
    });
  };

  const userLogin = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading

    try {
      const isValid = await loginSchema.isValid(formData);
      if (isValid) {
        console.log("API input:", formData);
        // Axios post request
        const response = await axios.post(LOGIN_API, formData);
        const data = response.data;

        console.log("API Response:", data); // Debugging API response
        if (data.result) {
          localStorage.setItem("user", JSON.stringify(data.data));
          navigate("/dashboard");
        } else {
          setLoginError(data.message);
        }
      } else {
        setErrors({ validation: t("please_enter_username_password") });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError(t("an_error_occurred"));
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
        <>
      <div>
        <AppHeader />
      </div>
      <div className="login template d-flex justify-content-center align-items-center vh-100 bg-primary">
        <div className="form_container p-5 rounded bg-white">
          <form onSubmit={userLogin}>
            <h3 className="text-center text-success">{t("sign_in")}</h3>
            {loginError && <p className="text-danger">{loginError}</p>}
            {errors.validation && (
              <p className="text-danger">{errors.validation}</p>
            )}
            <div className="m2 text-primary">
              <label htmlFor="username">{t("mobile_number")}</label>
              <input
                type="text"
                name="username"
                placeholder={t("enter_mobile_number")}
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleUsernameBlur} // Call API when username input loses focus
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
            {userTypes.length > 1 && (
              <div className="m2 text-primary">
                <label htmlFor="userType">{t("userType")}</label>
                <select
                  name="userType"
                  className="form-control"
                  value={formData.userType}
                  onChange={handleUserTypeChange}
                >
                  {userTypes.map((type, index) => (
                    <option key={index} value={type.userType}>
                      {type.userTypeDescription}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="d-grid">
              <button className="btn btn-primary m-2" disabled={loading}>
                {loading ? (
                  <ClipLoader size={20} color={"#ffffff"} />
                ) : (
                  t("sign_in")
                )}
              </button>
            </div>
            <p className="text-center">
              <a href="">{t("forgot_password")} </a>
              <Link to="/purchase" className="m-5">
                {t("sign_up")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
