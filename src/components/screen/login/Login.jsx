import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaEye,
  FaEyeSlash,
  FaKey,
  FaMobileAlt,
  FaUserTag,
  FaSignInAlt,
  FaLock,
  FaShieldAlt
} from "react-icons/fa";
import { loginSchema } from "../../../validations/ValidationSchema";
import { LOGIN_API, LOGIN_USER_ACCOUNT_CHECK_API } from "../../common/CommonApiURL";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ClipLoader } from "react-spinners";
import AppHeader from "../../common/AppHeader";
import styled from "styled-components";

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AuthIllustration = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem;
    text-align: center;
  }
`;

const IllustrationContent = styled.div`
  max-width: 500px;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    line-height: 1.6;
  }
`;

const FormContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const AuthForm = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  max-width: 500px;
  width: 100%;
  
  @media (max-width: 576px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h3`
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
  color: #2d3436;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: #0984e3;
    border-radius: 2px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #636e72;
    font-weight: 500;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #0984e3;
    box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
  }

  .input-icon {
    padding: 0 1rem;
    color: #636e72;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: none;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const PasswordToggle = styled.span`
  padding: 0 1rem;
  cursor: pointer;
  color: #636e72;
  transition: color 0.3s ease;

  &:hover {
    color: #0984e3;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(9, 132, 227, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const AdditionalLinks = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  a {
    color: #636e72;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #0984e3;
    }
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  color: #636e72;
  font-size: 0.9rem;

  svg {
    flex-shrink: 0;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 71, 87, 0.2);
`;

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
      <AppHeader />
      <LoginContainer>
        <AuthIllustration>
          <IllustrationContent>
            <h2>{t("welcome_back")}</h2>
            <p>{t("login_illustration_text")}</p>
            <div style={{ marginTop: '2rem' }}>
              <FaShieldAlt size={80} opacity={0.9} />
            </div>
          </IllustrationContent>
        </AuthIllustration>

        <FormContainer>
          <AuthForm>
            <FormTitle>{t("sign_in")}</FormTitle>
            
            {loginError && <ErrorMessage>{loginError}</ErrorMessage>}
            {errors.validation && <ErrorMessage>{errors.validation}</ErrorMessage>}

            <form onSubmit={userLogin}>
              <InputGroup>
                <label>{t("mobile_number")}</label>
                <InputWrapper>
                  <span className="input-icon"><FaMobileAlt /></span>
                  <StyledInput
                    type="text"
                    name="username"
                    placeholder={t("enter_mobile_number")}
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleUsernameBlur}
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <label>{t("password")}</label>
                <InputWrapper>
                  <span className="input-icon"><FaKey /></span>
                  <StyledInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("enter_password")}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <PasswordToggle onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </PasswordToggle>
                </InputWrapper>
              </InputGroup>

              {userTypes.length > 1 && (
                <InputGroup>
                  <label>{t("userType")}</label>
                  <InputWrapper>
                    <span className="input-icon"><FaUserTag /></span>
                    <StyledInput
                      as="select"
                      name="userType"
                      value={formData.userType}
                      onChange={handleUserTypeChange}
                    >
                      {userTypes.map((type, index) => (
                        <option key={index} value={type.userType}>
                          {type.userTypeDescription}
                        </option>
                      ))}
                    </StyledInput>
                  </InputWrapper>
                </InputGroup>
              )}

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <ClipLoader size={20} color={"#ffffff"} />
                ) : (
                  <>
                    <FaSignInAlt />
                    {t("sign_in")}
                  </>
                )}
              </SubmitButton>
            </form>

            <AdditionalLinks>
              <Link to="/forgot-password">{t("forgot_password")}</Link>
             
              <Link to="/purchase">{t("sign_up")}</Link>
            </AdditionalLinks>

            <SecurityInfo>
              <FaLock />
              <span>{t("login_security_note")}</span>
            </SecurityInfo>
          </AuthForm>
        </FormContainer>
      </LoginContainer>
    </>
  );
};

export default Login;