import React, { useState,useEffect } from "react";
import { FaCheck, FaRedo,FaUserPlus  } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { AiOutlineSend } from 'react-icons/ai';
import {
  Form,
  FormGroup,
  FormLabel,
  Button,
  Card,
  CardBody,
  Col,
  Row,
  FormCheck,
} from "react-bootstrap";
import {
  OTP_KEY,
  SEND_OTP_API,
  SAVE_NEW_CUSTOMER_API,
  GET_MOBILE_CHECK_API,
  SAVE_REGISTRATION_INITIAL_API,
} from "../common/CommonApiURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import Header from "../common/Header";
import InputWithMicrophone from "../common/InputWithMicrophone";
import "./css/Registration.css"; // Ensure you import the CSS file

const Registration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    primary_phone: "",
    secondary_phone: "",
    country: "",
    state: "",
    district: "",
    address_line1: "",
    address_line2: "",
    is_primary_phone_whatsup: false,
    is_secondary_phone_whatsup: false,
    pincode: 0,
    createdBy: "0",
    createdDt: "2024-07-06T10:07:21.637Z",
    updateddBy: "0",
    updatedDt: "2024-07-06T10:07:21.637Z",
    isActive: true,
    password: "",
    otp: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMandatoryOnly, setShowMandatoryOnly] = useState(true);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(180); // 3 minutes
  const [resendEnabled, setResendEnabled] = useState(false);

  useEffect(() => {
    let interval;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
      setResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const handleFocus = (fieldName) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: null // Clear the specific error for the field
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const generateOtp = () => {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleOtpSend = async () => {
    const validationErrors = {};
  
    // Validate mobile number
    if (!/^\d{10}$/.test(formData.primary_phone)) {
      toast.error("Mobile number must be 10 digits");
      validationErrors.primary_phone = "Mobile number must be 10 digits";
      setErrors(validationErrors);
      return;
    }
  
    // Generate and store OTP
    const otp = generateOtp();
    console.log(otp,'OTP TESTING')
    setGeneratedOtp(otp);
    try {
      // Make the mobile check API call
      const mobileCheckResponse = await axios.get(GET_MOBILE_CHECK_API, {
        params: {
          userName: formData.primary_phone,
          appName: "MOI",
          userType: "AU",
        },
      });
  
      const mobileCheck = mobileCheckResponse.data;
  
      // Check if mobile number is valid to send OTP
      if (mobileCheck.result) {
        // Send OTP if mobile check passed
        await sendOtp(otp);
      } else {
        toast.error(mobileCheck.message || "Mobile number already exists or is invalid.");
      }
    } catch (error) {
      // Log the error and show a toast message for failure
      console.error("Error checking mobile number:", error.response ? error.response.data : error);
      toast.error(error.response?.data?.message || "Error checking mobile number. Please try again.");
    }
  };
  
  // Separated function to handle sending OTP
  const sendOtp = async (otp) => {
    try {
      //console.log('Sending OTP:', otp);
      await axios.get(SEND_OTP_API, {
        params: {
          authorization: OTP_KEY,
          route: "otp",
          variables_values: otp,
          flash: 0,
          numbers: formData.primary_phone,
        },
      });
  
      toast.success("OTP sent successfully!");
      setOtpSent(true);
      setOtpTimer(180); // Restart OTP timer
      setResendEnabled(false); // Disable resend button initially
    } catch (error) {
      console.error("Error sending OTP:", error.response ? error.response.data : error);
      toast.error("Error sending OTP. Please try again.");
    }
  };
  

  const handleOtpVerify = () => {
    // Verify the entered OTP against the stored OTP
    if (formData.otp === generatedOtp) {
      setOtpVerified(true);
      const payload = {
        id:0,
        primary_phone:formData.primary_phone,
        userType:'AU',
        customerId:0,
        country_code:'+91',
        appName:'MOI',
        createdBy:'SYSTEM',
        createdDt:new Date()
      };
 
    axios.post(SAVE_REGISTRATION_INITIAL_API, payload)
  .then(response => {
    // Handle the response
    console.log('Success:', response.data);
  })
  .catch(error => {
    // Handle the error
    console.error('Error:', error);
  });
  
      toast.success("OTP Verified!");
    } else {
      toast.error("Invalid OTP");
      // setErrors((prev) => ({ ...prev, otp: "Invalid OTP" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Please Enter Your Name";
    }

    if (!formData.primary_phone.trim()) {
      validationErrors.primary_phone ="Please Enter valid 10 digit Mobile Number";
    } else if (!/^\d{10}$/.test(formData.primary_phone)) {
      validationErrors.primary_phone = "Mobile number must be 10 digits";
    }
    if (!/^\d{6}$/.test(formData.otp)) {
      validationErrors.otp = "OTP must be exactly 6 digits";
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      validationErrors.pincode = "Please Enter valid 6 digit pincode";
    }
    

    if (!formData.password.trim()) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      validationErrors.password = "Password should be at least 6 characters";
    }

    if (formData.conpassword !== formData.password) {
      validationErrors.conpassword = "Passwords do not match";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true); // Start the loader
      try {
        await axios.post(SAVE_NEW_CUSTOMER_API, formData);
        toast.success("Registration successful!");
        navigate("/login");
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something Went Wrong please Try Again.");
        }
      } finally {
        setIsLoading(false); // Stop the loader
      }
    }
  };

  const handleShowMandatoryOnlyChange = (e) => {
    setShowMandatoryOnly(e.target.checked);
  };

  return (
    <Card className="mt-1">
      <Header
        titles={[t("registration")]}
        links={[
          { to: "/", label: t("home") },
          { to: "/services", label: t("ourServices") },
        ]}
        showLanguageSelector={true}
      />
      <CardBody>
        {isLoading ? (
          <div className="loading-container">
            <Oval
              height={80}
              width={80}
              color="#4fa94d"
              visible={true}
              ariaLabel="oval-loading"
              secondaryColor="#4fa94d"
              strokeWidth={2}
              strokeWidthSecondary={2}
            />
            <p className="loading-text">{t("processing_your_request")}...</p>
          </div>
        ) : (
          <Form className="text-primary w-100" onSubmit={handleSubmit}>
            <FormGroup controlId="showMandatoryOnly" className="mb-3">
              <FormCheck
                type="checkbox"
                label={t("display_mandatory_fields_only")}
                checked={showMandatoryOnly}
                onChange={handleShowMandatoryOnlyChange}
              />
            </FormGroup>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="txtname">
                  <FormLabel>
                    {t("name")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("enter_name")}
                    error={errors.name}
                    onFocus={handleFocus} 
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="primary_phone">
                  <FormLabel>
                    {t("primary_phone")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <div className="d-flex">
                    <InputWithMicrophone
                      name="primary_phone"
                      value={formData.primary_phone}
                      onChange={handleChange}
                      placeholder={t("enter_primary_phone")}
                      error={errors.primary_phone}
                      disabled={otpVerified}
                      onFocus={handleFocus} 
                      className="me-2 flex-grow-1"
                    />
                    <Button
                      className="btn-sm d-flex align-items-center justify-content-center"
                      variant="primary"
                      onClick={handleOtpSend}
                      disabled={(otpSent && !resendEnabled) || otpVerified} 
                      style={{ height: "38px" }}
                    >
                      <AiOutlineSend className="me-1" /> {t("sendOTP")}
                    </Button>
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="txtotp">
                  <FormLabel>
                    {t("otp")} <span className="text-danger">*</span>
                  </FormLabel>
                  <div className="d-flex">
                    <InputWithMicrophone
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder={t("enter_otp")}
                      disabled={otpVerified}
                      error={errors.otp}
                      onFocus={handleFocus} 
                      className="me-1 flex-grow-1"
                    />
                    <Button
                      className="btn-sm d-flex align-items-center justify-content-center"
                      variant="success"
                      onClick={handleOtpVerify}
                      disabled={formData.otp.length !== 6 || otpVerified}
                      style={{ height: "38px" }}
                    >
                      <FaCheck className="me-1" /> {t("verifyOTP")}
                    </Button>
                    {resendEnabled && !otpVerified && (
                  <Button
                    className="me-1 btn-sm d-flex align-items-center justify-content-center"
                    variant="primary"
                    onClick={handleOtpSend}
                    disabled={otpVerified}
                    style={{ height: '38px' }}
                  >
                    <FaRedo className="me-1" /> {t("resendOTP")}
                  </Button>
                )}
                  </div>
                </FormGroup>
                {otpSent && !otpVerified && (
                 <div>
                  {otpTimer > 0 && otpSent && (
                    <Col xs={12}>
                      <p className="mt-1">
                        {t("resendIn")} {otpTimer} {t("seconds")}
                      </p>
                    </Col>
                  )}
                  </div>
      )}
              </Col>
              
            </Row>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="password">
                  <FormLabel>
                    {t("password")} <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("enter_password")}
                    error={errors.password}
                    onFocus={handleFocus} 
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="conpassword">
                  <FormLabel>
                    {t("confirm_password")}{" "}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="conpassword"
                    type="password"
                    value={formData.conpassword}
                    onChange={handleChange}
                    placeholder={t("confirm_password")}
                    error={errors.conpassword}
                    onFocus={handleFocus} 
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="pincode">
                  <FormLabel>
                    {t("pincode")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder={t("enter_pincode")}
                    error={errors.pincode}
                    onFocus={handleFocus} 
                  />
                </FormGroup>
              </Col>
            </Row>

            {!showMandatoryOnly && (
              <>
                <Row className="mb-3">
                  <Col xs={12} md={4}>
                    <FormGroup controlId="country">
                      <FormLabel>{t("country")}</FormLabel>
                      <InputWithMicrophone
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder={t("enter_country")}
                        error={errors.country}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4}>
                    <FormGroup controlId="state">
                      <FormLabel>{t("state")}</FormLabel>
                      <InputWithMicrophone
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder={t("enter_state")}
                        error={errors.state}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4}>
                    <FormGroup controlId="district">
                      <FormLabel>{t("district")}</FormLabel>
                      <InputWithMicrophone
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder={t("enter_district")}
                        error={errors.district}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col xs={12} md={4}>
                    <FormGroup controlId="address_line1">
                      <FormLabel>{t("address_line1")}</FormLabel>
                      <InputWithMicrophone
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        placeholder={t("enter_address_line1")}
                        error={errors.address_line1}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4}>
                    <FormGroup controlId="address_line2">
                      <FormLabel>{t("address_line2")}</FormLabel>
                      <InputWithMicrophone
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        placeholder={t("enter_address_line2")}
                        error={errors.address_line2}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <FormGroup id="is_primary_phone_whatsup">
                      <FormCheck
                        type="checkbox"
                        label={t("is_primary_phone_whatsup")}
                        name="is_primary_phone_whatsup"
                        checked={formData.is_primary_phone_whatsup}
                        onChange={handleCheckboxChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </>
            )}
            <Row>
              <Col xs={12} className="text-center">
                <Button 
                type="submit"
                 variant="success"
                 disabled={!otpVerified}
                 >
                <FaUserPlus  className="me-1" />{t("register")}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default Registration;
