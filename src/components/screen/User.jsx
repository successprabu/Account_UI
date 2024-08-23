import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  FormControl,
  FormLabel,
  Button,
  Card,
  CardBody,
  Col,
  Row,
  InputGroup,
  FormCheck
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";
import Translator from "../common/TranslationBasedOnLanguage";
import "./css/Transaction.css";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { API_SERVICE } from "../common/CommonMethod";
import { LIST_CLIENT_API,SAVE_NEW_USER_API } from "../common/CommonApiURL";
import Header from "../common/Header";
import { ClientTable, ClearButton, SaveButton } from "./css/styles";
import { FaSave , FaTimes } from "react-icons/fa";
import { format } from "date-fns";


const formatDate = (dateString) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};



const User = () => {
  const { t } = useTranslation();
  const schema = yup.object().shape({
    name: yup.string().required(t('required')),
    primary_phone: yup.string().required(t('required')),
    password: yup.string().required(t('required')),
    conpassword: yup
    .string()
    .oneOf([yup.ref('password'), null], t('passwordMatch'))
    .required(t('required')),
  email: yup.string().email(t('invalidEmail')).nullable(),
  });


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
    password: "Welcome@24",
    userType:"NU"
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const [userList, setUserList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Define refs
  const nameRef = useRef(null);
  const primaryRef = useRef(null);
  const passwordRef = useRef(null);
  const conpasswordRef = useRef(null);
  const emailRef = useRef(null);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  const handleClear = () => {
    setFormData({
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
        password: "",
        userType:"NU"
    });
  };
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetail = JSON.parse(user);

      setFormData((prevFormData) => ({
        ...prevFormData,
        customerId: userDetail.customerID,
      }));
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (i18n.language === "ta") {
      // Additional setup for Tamil language if needed
    }
  }, [i18n.language]);

 useEffect(() => {
   fetchUserList();
 }, [formData.customerId]);

  const fetchUserList = () => {
    const user = localStorage.getItem("user");
    API_SERVICE.get(LIST_CLIENT_API, {
      id: null,
      customer_id: JSON.parse(user).customerID,
      function_name: "",
      current_page: 1,
      page_size: 10,
    })
      .then((response) => {
        setUserList(response.data.data.customers || []);
      })
      .catch((error) => {
        console.error("Error fetching Function list:", error);
        toast.error("Error fetching Function list");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    // Check if the input ends with a space to trigger translation
    if (value.endsWith(" ")) {
      setFieldBeingTranslated(name);
    }
  };

  
  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [fieldBeingTranslated]: translatedText,
      }));
      setFieldBeingTranslated(null);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });
      console.log(formData,"payload")
      API_SERVICE.post(SAVE_NEW_USER_API, formData)
        .then((response) => {
          if (response.data.result) {
            setFormData({
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
                password: "Welcome@24",
                userType:"NU"
            });
            toast.success("User Saved Successfully");
            fetchUserList(); // Refetch updated list
          } else {
            toast.error(
              response.data.message ||
                "Something went wrong on User Save..pls Try Again"
            );
          }
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "API call error");
          console.error("API call error:", error);
        });
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach((error) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
    }
  };

  const handleEdit = (transaction) => {
    // setFormData({
    //   id: transaction.id,
    //   customerId: transaction.customerId,
    //   functionName: transaction.functionName,
    //   functionDate: transaction.functionDate
    //     ? formatDate(transaction.functionDate)
    //     : "",
    //   mahalName: transaction.mahalName,
    //   funPersionNames: transaction.funPersionNames,
    //   remarks: transaction.remarks,
    //   funMessage: transaction.funMessage,
    //   createdBy: transaction.createdBy,
    //   createdDt: transaction.createdDt,
    //   updatedBy: transaction.updatedBy,
    //   updatedDt: transaction.updatedDt,
    //   isActive: transaction.isActive,
    // });
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const startRecording = (fieldName) => {
    setIsRecording(true);
    setRecordingField(fieldName);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = i18n.language === "ta" ? "ta-IN" : "en-US";
    recognitionRef.current.onresult = (event) => {
      setFormData({
        ...formData,
        [fieldName]: event.results[0][0].transcript,
      });
    };
    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingField(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = (fieldName) => {
    if (isRecording && recordingField === fieldName) {
      stopRecording();
    } else {
      startRecording(fieldName);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-danger">
        {t("authentication_required")}{" "}
        <span className="text-primary">
          <Link to="/login">{t("login_here")}</Link>
        </span>
      </div>
    );
  }

  return (
    <Card>
      <Header
        titles={[t("userCreate")]}
        links={[{ to: "/dashboard", label: t("dashboard") }]}
      />
      <CardBody>
        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="name">
                <FormLabel>
                  {t("name")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_name")}
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                    ref={nameRef}
                    onKeyDown={(e) => handleKeyDown(e, nameRef)}
                  />
            
                  <Button
                    variant={
                      isRecording && recordingField === "name"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("name")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "name"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                  <FormControl.Feedback type="invalid">
                    {errors.name}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="primary_phone">
                <FormLabel>
                  {t("primary_phone")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_primary_phone")}
                    name="primary_phone"
                    id="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleChange}
                    isInvalid={!!errors.primary_phone}
                    ref={primaryRef}
                    onKeyDown={(e) => handleKeyDown(e, primaryRef)}
                  />
                  <FormControl.Feedback type="invalid">
                    {errors.primary_phone}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
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
          </Row>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="password">
                <FormLabel>
                  {t("password")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="password"
                    placeholder={t("enter_password")}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    ref={passwordRef}
                    onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "password"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("password")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "password"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                  <FormControl.Feedback type="invalid">
                    {errors.password}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="conpassword">
                <FormLabel>{t("conpassword")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_confirm_password")}
                    name="conpassword"
                    id="conpassword"
                    value={formData.conpassword}
                    onChange={handleChange}
                    ref={conpasswordRef}
                    isInvalid={!!errors.conpassword}
                    onKeyDown={(e) => handleKeyDown(e, conpasswordRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "conpassword"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("conpassword")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "conpassword"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                  <FormControl.Feedback type="invalid">
                    {errors.conpassword}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="email">
                <FormLabel>{t("email")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_email")}
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    ref={emailRef}
                    isInvalid={!!errors.email}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "email"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("email")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "email"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                  <FormControl.Feedback type="invalid">
                    {errors.email}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
          </Row>
          <Row className="mb-3 d-flex justify-content-center">
            <Col
              xs="auto"
              md="auto"
              sm="auto"
              className="d-flex justify-content-between align-items-center"
            >
              <SaveButton variant="success" type="submit" className="me-1">
               <FaSave className="me-2" />
                {t("save")}
              </SaveButton>
              <ClearButton
                onClick={handleClear}
                className="d-flex align-items-center"
              >
                <FaTimes className="me-2" />
                {t("clearButton")}
              </ClearButton>
            </Col>
          </Row>
        </Form>
         {/* Translator Component */}
         {/* <Translator
              inputText={formData[fieldBeingTranslated] || ""}
              onTranslated={handleTranslation}
              sourceLanguage="en"
              targetLanguage= {i18n.language ||"en" }
            /> */}
        <div className="mt-4">
          <h5 style={{ color: "#0e2238", fontWeight: "bold" }}>
            {t("user_list")}
          </h5>

          <ClientTable className="table table-striped">
            <thead>
              <tr>
                {/* <th>{t("id")}</th> */}
                <th>{t("name")}</th>
                <th>{t("primary_phone")}</th>
                <th>{t("whatsapp")}</th>
                <th>{t("active")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.primary_phone}</td>
                <td>{user.is_primary_phone_whatsup ? t("yes") : t("no")}</td>
                <td>{user.isActive ? t("yes") : t("no")}</td>
                  <td>
                    <i
                      className="fa-solid fa-pen-to-square text-primary me-2"
                      role="presentation"
                      title={t("edit")}
                      onClick={() => handleEdit(user)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </ClientTable>
        </div>
      </CardBody>
    </Card>
  );
};

export default User;
