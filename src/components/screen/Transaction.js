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
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { FaSave, FaTimes } from "react-icons/fa";
import i18n from "../../language/i18n";
import "./css/Transaction.css";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import Header from "../common/Header";
import { SaveButton, ClearButton } from "./css/styles";
import Translator from "../common/TranslationBasedOnLanguage";

const schema = yup
  .object()
  .shape({
    villageName: yup.string().required(),
    name: yup.string().required(),
    initial: yup.string(),
    amount: yup
      .number()
      .required("Please Enter Old / New Amount")
      .positive("Please Enter Old / New Amount"),
    oldAmount: yup
      .number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
    newAmount: yup
      .number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
    phoneNo: yup.string().matches(/^\d*$/, "Please Enter Valid Number"),
    remarks: yup.string(),
  })
  .test(
    "either-old-or-new-amount",
    "Either old amount or new amount is required and must be greater than zero",
    function (values) {
      const { oldAmount, newAmount } = values;
      return (oldAmount && oldAmount > 0) || (newAmount && newAmount > 0);
    }
  );

const Transaction = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    villageName: "",
    initial: "",
    name: "",
    oldAmount: 0,
    newAmount: 0,
    amount: 0,
    remarks: "",
    phoneNo: "",
    createdBy: "SYSTEM",
    createdDt: new Date().toISOString(),
    updatedBy: "SYSTEM",
    updatedDt: new Date().toISOString(),
    isActive: true,
    type: "R",
    returnStatus: "N",
    returnRemark: "",
    functionId: 0,
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [lastRecord, setLastRecord] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Refs for form controls
  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const oldAmountRef = useRef(null);
  const newAmountRef = useRef(null);
  const amountRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);

  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetail = JSON.parse(user);
      setFormData((prevFormData) => ({
        ...prevFormData,
        customerId: userDetail.customerID,
        functionId: userDetail.functionId,
        createdBy: String(userDetail.id),
        updatedBy: String(userDetail.id),
      }));
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      amount: Number(prevFormData.oldAmount) + Number(prevFormData.newAmount),
    }));
    setIsSaving(false);
  }, [formData.oldAmount, formData.newAmount]);

  const fetchTamilSuggestions = async (text, fieldName) => {
    console.log(`Fetching suggestions for text: "${text}", field: ${fieldName}, autoTranslateEnabled: ${autoTranslateEnabled}`);
    if (!autoTranslateEnabled || !text.trim()) {
      console.log("Suggestions cleared: autoTranslateEnabled is false or text is empty");
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    try {
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
        text
      )}&itc=ta-t-i0-und&num=5`;
      console.log(`API URL: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      console.log("API response:", data);

      if (data && Array.isArray(data[1]) && data[1][0] && Array.isArray(data[1][0][1])) {
        console.log("Suggestions found:", data[1][0][1]);
        setSuggestions(data[1][0][1]);
        setActiveSuggestionField(fieldName);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1); // Reset selection when new suggestions load
      } else {
        console.log("No valid suggestions in response");
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error("Error fetching Tamil suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      toast.error("Failed to fetch suggestions. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`handleChange triggered: name=${name}, value=${value}`);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    // Trigger suggestions for every letter typed in relevant fields
    if (["villageName", "name", "initial", "remarks"].includes(name)) {
      if (!autoTranslateEnabled || !value.trim()) {
        console.log("Clearing suggestions: autoTranslateEnabled=false or value is empty");
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionField(null);
        setSelectedSuggestionIndex(-1);
      } else {
        console.log(`Fetching suggestions for ${name}: ${value}`);
        setActiveSuggestionField(name);
        fetchTamilSuggestions(value, name);
      }
    }

    // Trigger translation if input ends with a space (retained for compatibility)
    if (value.endsWith(" ")) {
      setFieldBeingTranslated(name);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log(`Suggestion selected: ${suggestion} for field: ${activeSuggestionField}`);
    if (activeSuggestionField) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [activeSuggestionField]: suggestion,
      }));
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionField(null);
    setSelectedSuggestionIndex(-1);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const userDetail = JSON.parse(localStorage.getItem("user"));
    if (!userDetail || userDetail.functionId === 0) {
      toast.error("Please Create Function Detail");
      return;
    }
    setIsSaving(true);
    try {
      await schema.validate(formData, { abortEarly: false });
      API_SERVICE.post(SAVE_NEW_TRANS_API, formData)
        .then(async (response) => {
          if (response.data.result) {
            try {
              const lastRecordResponse = response.data;
              setLastRecord(lastRecordResponse.data);
            } catch (error) {
              toast.error("Error fetching updated last record");
              console.error("Error fetching updated last record:", error);
            }

            setFormData({
              id: 0,
              customerId: userDetail.customerID,
              villageName: "",
              initial: "",
              name: "",
              oldAmount: 0,
              newAmount: 0,
              amount: 0,
              remarks: "",
              phoneNo: "",
              createdBy: "SYSTEM",
              createdDt: new Date().toISOString(),
              updatedBy: "SYSTEM",
              updatedDt: new Date().toISOString(),
              isActive: true,
              type: "R",
              returnRemark: "",
              functionId: userDetail.functionId,
            });
            setSuggestions([]);
            setShowSuggestions(false);
            setActiveSuggestionField(null);
            setSelectedSuggestionIndex(-1);
            toast.success("Transaction Saved Successfully");
          } else {
            toast.error(
              response.data.message ||
                "Something went wrong on Transaction Save..pls Try Again"
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
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e, nextRef) => {
    console.log(`Key pressed: ${e.key}, showSuggestions: ${showSuggestions}`);
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        console.log(`ArrowDown: selectedSuggestionIndex set to ${selectedSuggestionIndex + 1}`);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : prev));
        console.log(`ArrowUp: selectedSuggestionIndex set to ${selectedSuggestionIndex - 1}`);
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        console.log(`Enter: Selected suggestion ${suggestions[selectedSuggestionIndex]}`);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionField(null);
        setSelectedSuggestionIndex(-1);
        console.log("Escape: Suggestions cleared");
      }
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
        console.log(`Enter/Tab: Focused next field`);
      }
    }
  };

  const startRecording = (fieldName) => {
    console.log(`Starting recording for ${fieldName}`);
    setIsRecording(true);
    setRecordingField(fieldName);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
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
    console.log("Stopping recording");
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

  const handleClear = () => {
    console.log("Clearing form and suggestions");
    const userDetail = JSON.parse(localStorage.getItem("user"));
    setFormData({
      id: 0,
      customerId: userDetail?.customerID || 0,
      villageName: "",
      initial: "",
      name: "",
      oldAmount: 0,
      newAmount: 0,
      amount: 0,
      remarks: "",
      phoneNo: "",
      createdBy: "SYSTEM",
      createdDt: new Date().toISOString(),
      updatedBy: "SYSTEM",
      updatedDt: new Date().toISOString(),
      isActive: true,
      type: "R",
      returnStatus: "N",
      returnRemark: "",
      functionId: userDetail?.functionId || 0,
    });
    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionField(null);
    setSelectedSuggestionIndex(-1);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-danger">
        {t("authentication_required")}{" "}
        <Link to="/login">{t("login_here")}</Link>
      </div>
    );
  }

  return (
    <Card>
      <Header
        titles={[t("addTransaction")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/transaction-list", label: t("transactionList") },
        ]}
        bgColor="#00C49F"
      />
      <CardBody>
        <div className="mb-3">
          <Form.Check
            type="switch"
            id="autoTranslateSwitch"
            label="Enable Auto-Suggestion"
            checked={autoTranslateEnabled}
            onChange={() => {
              setAutoTranslateEnabled(!autoTranslateEnabled);
              console.log(`Auto-suggestion toggled to: ${!autoTranslateEnabled}`);
              if (!autoTranslateEnabled) {
                setSuggestions([]);
                setShowSuggestions(false);
                setActiveSuggestionField(null);
                setSelectedSuggestionIndex(-1);
              }
            }}
          />
        </div>

        {lastRecord && (
          <Card className="mb-3">
            <CardHeader>
              {t("lastRecordHistory")}
              <Button
                variant="link"
                className="float-end"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                aria-controls="lastRecordContent"
              >
                {isExpanded ? "-" : "+"}
              </Button>
            </CardHeader>
            {isExpanded && (
              <CardBody id="lastRecordContent">
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("placeName")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction.villageName}
                  </Col>
                </Row>
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("name")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction.name}
                  </Col>
                </Row>
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("amount")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction.amount}
                  </Col>
                </Row>
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("totalRecord")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.totalTrans}
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("totalAmount")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.totalAmount}
                  </Col>
                </Row>
              </CardBody>
            )}
          </Card>
        )}

        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="villageName">
                <FormLabel>
                  {t("village")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_village")}
                    name="villageName"
                    id="villageName"
                    value={formData.villageName}
                    onChange={handleChange}
                    ref={villageNameRef}
                    onKeyDown={(e) => handleKeyDown(e, nameRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "villageName"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("villageName")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "villageName"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.villageName && (
                  <div className="text-danger">{errors.villageName}</div>
                )}
                {showSuggestions && activeSuggestionField === "villageName" && (
                  <div
                    className="suggestions-dropdown"
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxWidth: "200px",
                      marginTop: "5px",
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: index === selectedSuggestionIndex ? "#e0e0e0" : "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) =>
                          (e.target.style.background = index === selectedSuggestionIndex ? "#e0e0e0" : "#fff")
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            </Col>
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
                    ref={nameRef}
                    onKeyDown={(e) => handleKeyDown(e, initialRef)}
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
                </InputGroup>
                {errors.name && (
                  <div className="text-danger">{errors.name}</div>
                )}
                {showSuggestions && activeSuggestionField === "name" && (
                  <div
                    className="suggestions-dropdown"
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxWidth: "200px",
                      marginTop: "5px",
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: index === selectedSuggestionIndex ? "#e0e0e0" : "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) =>
                          (e.target.style.background = index === selectedSuggestionIndex ? "#e0e0e0" : "#fff")
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="initial">
                <FormLabel>{t("initial")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_initial")}
                    name="initial"
                    id="initial"
                    value={formData.initial}
                    onChange={handleChange}
                    ref={initialRef}
                    onKeyDown={(e) => handleKeyDown(e, oldAmountRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "initial"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("initial")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "initial"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.initial && (
                  <div className="text-danger">{errors.initial}</div>
                )}
                {showSuggestions && activeSuggestionField === "initial" && (
                  <div
                    className="suggestions-dropdown"
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxWidth: "200px",
                      marginTop: "5px",
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: index === selectedSuggestionIndex ? "#e0e0e0" : "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) =>
                          (e.target.style.background = index === selectedSuggestionIndex ? "#e0e0e0" : "#fff")
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="oldAmount">
                <FormLabel>
                  {t("oldAmount")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_amount")}
                    name="oldAmount"
                    value={formData.oldAmount}
                    onChange={handleChange}
                    ref={oldAmountRef}
                    onKeyDown={(e) => handleKeyDown(e, newAmountRef)}
                    min="0"
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "oldAmount"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("oldAmount")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "oldAmount"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.oldAmount && (
                  <div className="text-danger">{errors.oldAmount}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="newAmount">
                <FormLabel>
                  {t("newAmount")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_amount")}
                    name="newAmount"
                    value={formData.newAmount}
                    onChange={handleChange}
                    ref={newAmountRef}
                    onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
                    min="0"
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "newAmount"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("newAmount")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "newAmount"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.newAmount && (
                  <div className="text-danger">{errors.newAmount}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="amount">
                <FormLabel>
                  {t("total")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_amount")}
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    ref={amountRef}
                    disabled
                    onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
                  />
                </InputGroup>
                {errors.amount && (
                  <div className="text-danger">{errors.amount}</div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>
              <FormGroup controlId="phoneNo">
                <FormLabel>{t("mobile")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_mobile")}
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    ref={phoneNoRef}
                    onKeyDown={(e) => handleKeyDown(e, remarksRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "phoneNo"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("phoneNo")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "phoneNo"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.phoneNo && (
                  <div className="text-danger">{errors.phoneNo}</div>
                )}
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
                    onKeyDown={(e) => handleKeyDown(e, remarksRef)}
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
                {showSuggestions && activeSuggestionField === "remarks" && (
                  <div
                    className="suggestions-dropdown"
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxWidth: "200px",
                      marginTop: "5px",
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          background: index === selectedSuggestionIndex ? "#e0e0e0" : "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) =>
                          (e.target.style.background = index === selectedSuggestionIndex ? "#e0e0e0" : "#fff")
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Translator
            inputText={formData[fieldBeingTranslated] || ""}
            onTranslated={handleTranslation}
            sourceLanguage="en"
            targetLanguage={i18n.language || "en"}
          />
          <div className="d-flex justify-content-center mt-3">
            <SaveButton
              type="submit"
              variant="success"
              className="me-3"
              disabled={isSaving}
            >
              <FaSave className="me-2" />
              {isSaving ? t("processing_your_request") : t("save")}
            </SaveButton>
            <ClearButton type="button" variant="secondary" onClick={handleClear}>
              <FaTimes className="me-2" />
              {t("clearButton")}
            </ClearButton>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default Transaction;