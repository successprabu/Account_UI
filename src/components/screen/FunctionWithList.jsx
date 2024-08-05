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
import { SAVE_FUNCTION_API, LIST_FUNCTION_API } from "../common/CommonApiURL";
import Header from "../common/Header";
import { ClientTable, ClearButton, SaveButton } from "./css/styles";
import { FaSave , FaTimes } from "react-icons/fa";
import { format } from "date-fns";

const schema = yup.object().shape({
  functionName: yup.string().required(),
  functionDate: yup.date().required(),
  mahalName: yup.string().required(),
  funPersionNames: yup.string().required(),
  remarks: yup.string(),
  funMessage: yup.string(),
});

const formatDate = (dateString) => {
  return format(new Date(dateString), "dd/MM/yyyy");
};

const FunctionWithList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    functionName: "",
    functionDate: "",
    mahalName: "",
    funPersionNames: "",
    remarks: "",
    funMessage: "",
    createdBy: "SYSTEM",
    createdDt: new Date().toISOString(),
    updatedBy: "SYSTEM",
    updatedDt: new Date().toISOString(),
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);

  const [functionList, setFunctionList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Define refs
  const functionNameRef = useRef(null);
  const functionDateRef = useRef(null);
  const mahalNameRef = useRef(null);
  const funPersionNamesRef = useRef(null);
  const remarksRef = useRef(null);
  const funMessageRef = useRef(null);

  const handleClear = () => {
    setFormData({
      id: 0,
      customerId: formData.customerId,
      functionName: "",
      functionDate: "",
      mahalName: "",
      funPersionNames: "",
      remarks: "",
      funMessage: "",
      createdBy: "SYSTEM",
      createdDt: new Date().toISOString(),
      updatedBy: "SYSTEM",
      updatedDt: new Date().toISOString(),
      isActive: true,
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
      console.log(userDetail.customerID, "testcustomer");
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);


  useEffect(() => {
    fetchFunctionList();
  }, [formData.customerId]);

  const fetchFunctionList = () => {
    API_SERVICE.get(LIST_FUNCTION_API, {
      id: null,
      customer_id: formData.customerId,
      function_name: "",
      current_page: 1,
      page_size: 10,
    })
      .then((response) => {
        setFunctionList(response.data.data.functions || []);
      })
      .catch((error) => {
        console.error("Error fetching Function list:", error);
        toast.error("Error fetching Function list");
      });
  };

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
              id: 0,
              customerId: formData.customerId,
              functionName: "",
              functionDate: "",
              mahalName: "",
              funPersionNames: "",
              remarks: "",
              funMessage: "",
              createdBy: "SYSTEM",
              createdDt: new Date().toISOString(),
              updatedBy: "SYSTEM",
              updatedDt: new Date().toISOString(),
              isActive: true,
            });
            toast.success("Function Saved Successfully");
            fetchFunctionList(); // Refetch updated list
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

  const handleEdit = (transaction) => {
    setFormData({
      id: transaction.id,
      customerId: transaction.customerId,
      functionName: transaction.functionName,
      functionDate: transaction.functionDate
        ? formatDate(transaction.functionDate)
        : "",
      mahalName: transaction.mahalName,
      funPersionNames: transaction.funPersionNames,
      remarks: transaction.remarks,
      funMessage: transaction.funMessage,
      createdBy: transaction.createdBy,
      createdDt: transaction.createdDt,
      updatedBy: transaction.updatedBy,
      updatedDt: transaction.updatedDt,
      isActive: transaction.isActive,
    });
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
                    isInvalid={!!errors.functionName}
                    ref={functionNameRef}
                    onKeyDown={(e) => handleKeyDown(e, functionNameRef)}
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
                  <FormControl.Feedback type="invalid">
                    {errors.functionName}
                  </FormControl.Feedback>
                </InputGroup>
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
                    isInvalid={!!errors.functionDate}
                    ref={functionDateRef}
                    onKeyDown={(e) => handleKeyDown(e, functionDateRef)}
                  />
                  <FormControl.Feedback type="invalid">
                    {errors.functionDate}
                  </FormControl.Feedback>
                </InputGroup>
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
                    isInvalid={!!errors.mahalName}
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
                  <FormControl.Feedback type="invalid">
                    {errors.mahalName}
                  </FormControl.Feedback>
                </InputGroup>
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
                    type="text"
                    placeholder={t("enter_fun_person_names")}
                    name="funPersionNames"
                    id="funPersionNames"
                    value={formData.funPersionNames}
                    onChange={handleChange}
                    isInvalid={!!errors.funPersionNames}
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
                  <FormControl.Feedback type="invalid">
                    {errors.funPersionNames}
                  </FormControl.Feedback>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="remarks">
                <FormLabel>{t("remarks")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
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
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="funMessage">
                <FormLabel>{t("funMessage")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
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
        <div className="mt-4">
          <h5 style={{ color: "#0e2238", fontWeight: "bold" }}>
            {t("function_list")}
          </h5>

          <ClientTable className="table table-striped">
            <thead>
              <tr>
                {/* <th>{t("id")}</th> */}
                <th>{t("functionName")}</th>
                <th>{t("functionDate")}</th>
                <th>{t("mahalName")}</th>
                <th>{t("funPersionNames")}</th>
                <th>{t("remarks")}</th>
                <th>{t("funMessage")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {functionList.map((functions) => (
                <tr key={functions.id}>
                  {/* <td>{functions.id}</td> */}
                  <td>{functions.functionName}</td>
                  <td>{formatDate(functions.functionDate)}</td>
                  <td>{functions.mahalName}</td>
                  <td>{functions.funPersionNames}</td>
                  <td>{functions.remarks}</td>
                  <td>{functions.funMessage}</td>
                  <td>
                    <i
                      className="fa-solid fa-pen-to-square text-primary me-2"
                      role="presentation"
                      title={t("edit")}
                      onClick={() => handleEdit(functions)}
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

export default FunctionWithList;
