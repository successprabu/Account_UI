import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../App.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaEye,
  FaEyeSlash,
  FaKey,
  FaMobileAlt,
  FaUserTag,
  FaSignInAlt,
} from "react-icons/fa";
import { loginSchema } from "../../../validations/ValidationSchema";
import {
  LOGIN_API,
  LOGIN_USER_ACCOUNT_CHECK_API,
} from "../../common/CommonApiURL";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode library
import { ClipLoader } from "react-spinners";
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
  const [loading, setLoading] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const decodedToken = jwtDecode(user.token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleUsernameBlur = async () => {
    try {
      setLoginError([]);
      const response = await axios.get(
        `${LOGIN_USER_ACCOUNT_CHECK_API}userName=${formData.username}&appName=MOI`
      );
      const data = response.data;

      if (data.result && data.data.length > 0) {
        setFormData({
          ...formData,
          userType: data.data[0].userType,
          userTypeDescription: data.data[0].userTypeDescription,
        });

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
    setLoading(true);

    try {
      const isValid = await loginSchema.isValid(formData);
      if (isValid) {
        console.log("API input:", formData);
        const response = await axios.post(LOGIN_API, formData);
        const data = response.data;

        console.log("API Response:", data);
        if (data.result) {
          const decodedToken = jwtDecode(data.data.token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            localStorage.setItem("user", JSON.stringify(data.data));
            navigate("/dashboard");
          } else {
            setLoginError(t("session_expired"));
          }
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
      setLoading(false);
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

              <div className="input-group">
                <span className="input-group-text">
                  <FaMobileAlt /> {/* Mobile icon */}
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder={t("enter_mobile_number")}
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleUsernameBlur}
                />
              </div>
            </div>
            <div className="m2 text-primary">
              <label htmlFor="password">{t("password")}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaKey />
                </span>{" "}
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("enter_password")}
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span
                  className="input-group-text"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            {userTypes.length > 1 && (
              <div className="m2 text-primary">
                <label htmlFor="userType">{t("userType")}</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaUserTag /> {/* Display the role icon */}
                  </span>
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
              </div>
            )}
            <div className="d-grid">
              <button className="btn btn-primary m-2" disabled={loading}>
                {loading ? (
                  <ClipLoader size={20} color={"#ffffff"} />
                ) : (
                  <>
                    <FaSignInAlt style={{ marginRight: "8px" }} />{" "}
                    {/* Add Sign In Icon */}
                    {t("sign_in")}
                  </>
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
