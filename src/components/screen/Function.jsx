import React, { useState, useRef, useEffect } from "react";
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
  InputGroup,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";
import { transliterateToTamil } from "../common/transliteration";
import "./css/Transaction.css";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_FUNCTION_API, LIST_TRANSACTION_API } from "../common/CommonApiURL";
import Header from "../common/Header";
import { ClientTable } from "./css/styles";

const schema = yup.object().shape({
  functionName: yup.string().required(),
  functionDate: yup.date().required(),
  mahalName: yup.string().required(),
  funPersionNames: yup.number().required().positive(),
  remarks: yup.string(),
  funMessage: yup.string(),
});

const Function = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    functionName: "",
    functionDate: "",
    mahalName: "",
    funPersionNames: 0,
    remarks: "",
    funMessage: "",
    createdBy: "SYSTEM",
    createdDt: new Date().toISOString(),
    updatedBy: "SYSTEM",
    updatedDt: new Date().toISOString(),
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);

  const [transactionList, setTransactionList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Define refs
  const functionNameRef = useRef(null);
  const functionDateRef = useRef(null);
  const mahalNameRef = useRef(null);
  const funPersionNamesRef = useRef(null);
  const remarksRef = useRef(null);
  const funMessageRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetail = JSON.parse(user);
      // Initialize formData if needed
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
    // Fetch transactions list on component mount
    API_SERVICE.get(LIST_TRANSACTION_API)
      .then((response) => {
        setTransactionList(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching transaction list:", error);
        toast.error("Error fetching transaction list");
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = value;

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));

    // Check if the input ends with a space to trigger transliteration
    if (i18n.language === "ta" && updatedValue.endsWith(" ")) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: transliterateToTamil(updatedValue.trim()),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(formData, { abortEarly: false });
      API_SERVICE.post(SAVE_FUNCTION_API, formData)
        .then((response) => {
          if (response.data.result) {
            setFormData({
              functionName: "",
              functionDate: "",
              mahalName: "",
              funPersionNames: "",
              remarks: "",
              funMessage: "",
            });
            toast.success("Function Saved Successfully");
            // Fetch updated transaction list
            API_SERVICE.get(LIST_TRANSACTION_API)
              .then((response) => {
                setTransactionList(response.data || []);
              })
              .catch((error) => {
                console.error("Error fetching Function list:", error);
                toast.error("Error fetching Function list");
              });
          } else {
            toast.error(
              response.data.message ||
                "Something went wrong on Function Save..pls Try Again"
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
        titles={[t("functionCreate")]}
        links={[{ to: "/dashboard", label: t("dashboard") }]}
      />
      <CardBody>
        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="functionName">
                <FormLabel>
                  {t("functionName")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_function_name")}
                    name="functionName"
                    id="functionName"
                    value={formData.functionName}
                    onChange={handleChange}
                    ref={functionNameRef}
                    onKeyDown={(e) => handleKeyDown(e, functionDateRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "functionName"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("functionName")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "functionName"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.functionName && (
                  <div className="text-danger">{errors.functionName}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="functionDate">
                <FormLabel>
                  {t("functionDate")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="date"
                    placeholder={t("enter_function_date")}
                    name="functionDate"
                    id="functionDate"
                    value={formData.functionDate}
                    onChange={handleChange}
                    ref={functionDateRef}
                    onKeyDown={(e) => handleKeyDown(e, mahalNameRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "functionDate"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("functionDate")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "functionDate"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.functionDate && (
                  <div className="text-danger">{errors.functionDate}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="mahalName">
                <FormLabel>
                  {t("mahalName")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_mahal_name")}
                    name="mahalName"
                    id="mahalName"
                    value={formData.mahalName}
                    onChange={handleChange}
                    ref={mahalNameRef}
                    onKeyDown={(e) => handleKeyDown(e, funPersionNamesRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "mahalName"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("mahalName")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "mahalName"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.mahalName && (
                  <div className="text-danger">{errors.mahalName}</div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="funPersionNames">
                <FormLabel>
                  {t("funPersionNames")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_fun_persion_names")}
                    name="funPersionNames"
                    id="funPersionNames"
                    value={formData.funPersionNames}
                    onChange={handleChange}
                    ref={funPersionNamesRef}
                    onKeyDown={(e) => handleKeyDown(e, remarksRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "funPersionNames"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("funPersionNames")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "funPersionNames"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.funPersionNames && (
                  <div className="text-danger">{errors.funPersionNames}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="remarks">
                <FormLabel>{t("remarks")}</FormLabel>
                <InputGroup>
                  <FormControl
                    placeholder={t("enter_remarks")}
                    name="remarks"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    ref={remarksRef}
                    onKeyDown={(e) => handleKeyDown(e, funMessageRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "remarks"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("remarks")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "remarks"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.remarks && (
                  <div className="text-danger">{errors.remarks}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="funMessage">
                <FormLabel>{t("funMessage")}</FormLabel>
                <InputGroup>
                  <FormControl
                    as="textarea"
                    placeholder={t("enter_fun_message")}
                    name="funMessage"
                    id="funMessage"
                    value={formData.funMessage}
                    onChange={handleChange}
                    ref={funMessageRef}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "funMessage"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("funMessage")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "funMessage"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.funMessage && (
                  <div className="text-danger">{errors.funMessage}</div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Button variant="primary" type="submit" className="me-3">
            {t("save")}
          </Button>
          <Button type="button" variant="secondary">
              {t("clearButton")}
            </Button>
        </Form>
        <ClientTable striped bordered hover>
  <thead>
    <tr>
      <th>{t("functionName")}</th>
      <th>{t("functionDate")}</th>
      <th>{t("mahalName")}</th>
      <th>{t("funPersionNames")}</th>
      <th>{t("remarks")}</th>
      <th>{t("funMessage")}</th>
    </tr>
  </thead>
  <tbody>
    {transactionList.length > 0 ? (
      transactionList.map((transaction, index) => (
        <tr key={index}>
          <td>{transaction.functionName}</td>
          <td>{transaction.functionDate}</td>
          <td>{transaction.mahalName}</td>
          <td>{transaction.funPersionNames}</td>
          <td>{transaction.remarks}</td>
          <td>{transaction.funMessage}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" className="text-center">
          {t("noData")}
        </td>
      </tr>
    )}
  </tbody>
</ClientTable>
      </CardBody>
    </Card>
  );
};

export default Function;
