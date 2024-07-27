import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  FormControl,
  FormLabel,
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Row,
  FormCheck,
  InputGroup
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";
import { SAVE_NEW_CUSTOMER_API } from "../common/CommonApiURL";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Oval } from 'react-loader-spinner';

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
    createdBy: "",
    createdDt: "2024-07-06T10:07:21.637Z",
    updateddBy: "SYSTEM",
    updatedDt: "2024-07-06T10:07:21.637Z",
    isActive: true,
    password: "SYSTEM",
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

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
      validationErrors.primary_phone = "Please Enter valid 10 digit Mobile Number";
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
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something Went Wrong please Try Again.");
        }
      } finally {
        setIsLoading(false); // Stop the loader
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = "ta-IN"; // Set language to Tamil
    recognitionRef.current.onresult = (event) => {
      setTranscript(event.results[0][0].transcript);
      setFormData({
        ...formData,
        address_line1: event.results[0][0].transcript,
      });
    };
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="mt-1">
      <CardHeader>
        <h4 className="mb-0 text-primary">{t('registration')}</h4>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="text-center">
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
          </div>
        ) : (
          <Form className="text-primary w-100" onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="txtname">
                  <FormLabel>
                    {t('name')}<span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="text-danger">{errors.name}</div>}
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="primary_phone">
                  <FormLabel>
                    {t('primary_phone')}<span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_primary_phone')}
                    name="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleChange}
                  />
                  {errors.primary_phone && <div className="text-danger">{errors.primary_phone}</div>}
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="txtotp">
                  <FormLabel>
                    {t('otp')} <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_otp')}
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                  {errors.otp && <div className="text-danger">{errors.otp}</div>}
                </FormGroup>
              </Col>           
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="secondary_phone">
                  <FormLabel>
                    {t('secondary_phone')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_secondary_phone')}
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                  />
                  {errors.secondary_phone && <div className="text-danger">{errors.secondary_phone}</div>}
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
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="email">
                  <FormLabel>
                    {t('email')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_email')}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="password">
                  <FormLabel>
                    {t('password')} <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="password"
                    placeholder={t('enter_password')}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="conpassword">
                  <FormLabel>
                    {t('conpassword')} <span className="text-danger">*</span>
                  </FormLabel>
                  <FormControl
                    type="password"
                    placeholder={t('enter_confirm_password')}
                    name="conpassword"
                    value={formData.conpassword}
                    onChange={handleChange}
                  />
                  {errors.conpassword && <div className="text-danger">{errors.conpassword}</div>}
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="country">
                  <FormLabel>
                    {t('country')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_country')}
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="state">
                  <FormLabel>
                    {t('state')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_state')}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="district">
                  <FormLabel>
                    {t('district')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_district')}
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12} md={4}>
                <FormGroup controlId="address_line1">
                  <FormLabel>
                    {t('address_line1')}
                  </FormLabel>
                  <InputGroup>
                    <FormControl
                      type="text"
                      placeholder={t('enter_address_line1')}
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                    />
                    <Button variant={isRecording ? "danger" : "primary"} onClick={toggleRecording}>
                      <FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} />
                    </Button>
                  </InputGroup>
                  {errors.address_line1 && <div className="text-danger">{errors.address_line1}</div>}
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="address_line2">
                  <FormLabel>
                    {t('address_line2')}
                  </FormLabel>
                  <FormControl
                    type="text"
                    placeholder={t('enter_address_line2')}
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col xs={12} md={4}>
                <FormGroup controlId="pincode">
                  <FormLabel>
                    {t('pincode')}
                  </FormLabel>
                  <FormControl
                    type="number"
                    placeholder={t('enter_pincode')}
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
                          
            </Row>

            <Button type="submit" variant="primary" className="me-3">
              {t('save')}
            </Button>
            <Button type="button" variant="secondary">
              {t('cancel')}
            </Button>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default Registration;
