import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import i18n from "../../language/i18n";
import { SAVE_NEW_CUSTOMER_API } from "../common/CommonApiURL";
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
    createdBy: "APPLICATION",
    createdDt: "2024-07-06T10:07:21.637Z",
    updateddBy: "APPLICATION",
    updatedDt: "2024-07-06T10:07:21.637Z",
    isActive: true,
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMandatoryOnly, setShowMandatoryOnly] = useState(true);

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

  const handleLanguageChange = (e) => {
    const language = e.target.value;
    i18n.changeLanguage(language);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Please Enter Your Name";
    }

    if (!formData.primary_phone.trim()) {
      validationErrors.primary_phone =
        "Please Enter valid 10 digit Mobile Number";
    } else if (!/^\d{10}$/.test(formData.primary_phone)) {
      validationErrors.primary_phone = "Mobile number must be 10 digits";
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
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="primary_phone">
                  <FormLabel>
                    {t("primary_phone")}
                    <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleChange}
                    placeholder={t("enter_primary_phone")}
                    error={errors.primary_phone}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="txtotp">
                  <FormLabel>
                    {t("otp")} <span className="text-danger">*</span>
                  </FormLabel>
                  <InputWithMicrophone
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder={t("enter_otp")}
                    error={errors.otp}
                  />
                </FormGroup>
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
                  />
                </FormGroup>
              </Col>
            </Row>

            {!showMandatoryOnly && (
              <>
                {/* <Row className="mb-3">
                  <Col xs={12} md={4}>
                    <FormGroup controlId="secondary_phone">
                      <FormLabel>
                        {t('secondary_phone')}
                      </FormLabel>
                      <InputWithMicrophone
                        name="secondary_phone"
                        value={formData.secondary_phone}
                        onChange={handleChange}
                        placeholder={t('enter_secondary_phone')}
                        error={errors.secondary_phone}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <FormGroup id="is_primary_phone_whatsup">
                      <FormCheck
                        type="checkbox"
                        label={t('is_primary_phone_whatsup')}
                        name="is_primary_phone_whatsup"
                        checked={formData.is_primary_phone_whatsup}
                        onChange={handleCheckboxChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-center">
                    <FormGroup id="is_secondary_phone_whatsup">
                      <FormCheck
                        type="checkbox"
                        label={t('is_secondary_phone_whatsup')}
                        name="is_secondary_phone_whatsup"
                        checked={formData.is_secondary_phone_whatsup}
                        onChange={handleCheckboxChange}
                      />
                    </FormGroup>
                  </Col>
                </Row> */}
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
                <Button type="submit" variant="success">
                  {t("register")}
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
