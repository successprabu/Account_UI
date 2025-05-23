import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormGroup,
  FormControl,
  FormLabel,
  FormSelect,
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
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
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
    villageName: yup.string().required("Village name is required"),
    name: yup.string().required("Name is required"),
    initial: yup.string(),
    others: yup
      .number("Please enter a number")
      .required("Others amount is required")
      .min(0, "Amount cannot be negative"),
    othersType: yup.string().required("Please select an option"),
    amount: yup
      .number("Please enter a number")
      .min(0, "Amount cannot be negative"),
    phoneNo: yup.string().matches(/^\d*$/, "Please enter a valid number"),
    remarks: yup.string(),
    othersRemark: yup.string(),
  });

const OtherReceipt = () => {
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
    type: "O",
    returnStatus: "N",
    returnRemark: "",
    functionId: 0,
    others: 0,
    othersType: "",
    othersRemark: "",
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [lastRecord, setLastRecord] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Refs for form controls
  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const oldAmountRef = useRef(null);
  const newAmountRef = useRef(null);
  const otherRemarkRef = useRef(null);
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
    if (i18n.language === "ta") {
      console.log("Language set to Tamil");
    }
  }, [i18n.language]);

  const fetchTamilSuggestions = async (text, fieldName) => {
    console.log(`Fetching suggestions for text: "${text}", field: ${fieldName}, autoTranslateEnabled: ${autoTranslateEnabled}`);
    if (!autoTranslateEnabled || !text.trim()) {
      console.log("Suggestions cleared: autoTranslateEnabled is false or text is empty");
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Note: If CORS issues occur, use a proxy:
      // const url = `http://localhost:3000/proxy?text=${encodeURIComponent(text)}`;
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
      } else {
        console.log("No valid suggestions in response");
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching Tamil suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
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
    if (["villageName", "name", "initial", "remarks", "othersRemark"].includes(name)) {
      if (!autoTranslateEnabled || !value.trim()) {
        console.log("Clearing suggestions: autoTranslateEnabled=false or value is empty");
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionField(null);
      } else {
        console.log(`Fetching suggestions for ${name}: ${value}`);
        setActiveSuggestionField(name);
        fetchTamilSuggestions(value, name); // Direct call, no debounce
      }
    }

    // Trigger translation if input ends with a space
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
    const userDetail = JSON.parse(localStorage.getItem("user"));
    if (!userDetail || userDetail.functionId === 0) {
      toast.error("Please Create Function Detail");
      return;
    }

    try {
      console.log("Submitting payload:", formData);
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
              type: "O",
              returnRemark: "",
              others: 0,
              othersType: "",
              othersRemark: "",
              functionId: userDetail.functionId,
            });
            setSuggestions([]);
            setShowSuggestions(false);
            setActiveSuggestionField(null);
            setErrors({});
            toast.success("Details Saved Successfully");
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
    console.log(`Starting recording for ${fieldName}`);
    setIsRecording(true);
    setRecordingField(fieldName);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser");
      setIsRecording(false);
      setRecordingField(null);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = i18n.language === "ta" ? "ta-IN" : "en-US";
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`Speech recognized: ${transcript} for ${fieldName}`);
      setFormData({
        ...formData,
        [fieldName]: transcript,
      });
    };
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Speech recognition failed. Please try again.");
      setIsRecording(false);
      setRecordingField(null);
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
      updated: "SYSTEM",
      updatedDt: new Date().toISOString(),
      isActive: true,
      type: "O",
      returnStatus: "N",
      returnRemark: "",
      functionId: userDetail?.functionId || 0,
      others: 0,
      othersType: "",
      othersRemark: "",
    });
    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionField(null);
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
        titles={[t("addOthers")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/others-list", label: t("othersList") },
        ]}
        bgColor="#FFD700"
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
                    <strong>{t("others")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction.others}
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
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) => (e.target.style.background = "#fff")}
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
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) => (e.target.style.background = "#fff")}
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
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) => (e.target.style.background = "#fff")}
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
              <FormGroup controlId="others">
                <FormLabel>
                  {t("others")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_amount")}
                    name="others"
                    value={formData.others}
                    onChange={handleChange}
                    ref={oldAmountRef}
                    onKeyDown={(e) => handleKeyDown(e, newAmountRef)}
                    min="0"
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "others"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("others")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "others"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.others && (
                  <div className="text-danger">{errors.others}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="othersType">
                <FormLabel>
                  {t("othersType")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <FormSelect
                  name="othersType"
                  value={formData.othersType}
                  onChange={handleChange}
                  isInvalid={!!errors.othersType}
                >
                  <option value="">{t("select")}</option>
                  <option value="ring">{t("ring")}</option>
                  <option value="jain">{t("jain")}</option>
                  <option value="coin">{t("coin")}</option>
                  <option value="pattam">{t("pattam")}</option>
                  <option value="others">{t("others")}</option>
                </FormSelect>
                {errors.othersType && (
                  <div className="text-danger">{errors.othersType}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="amount">
                <FormLabel>{t("amount")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_description_detail")}
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    ref={amountRef}
                    onKeyDown={(e) => handleKeyDown(e, otherRemarkRef)}
                    min="0"
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "amount"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("amount")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "amount"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.amount && (
                  <div className="text-danger">{errors.amount}</div>
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={4}>
              <FormGroup controlId="othersRemark">
                <FormLabel>{t("othersRemarks")}</FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t("enter_description_detail")}
                    name="othersRemark"
                    value={formData.othersRemark}
                    onChange={handleChange}
                    ref={otherRemarkRef}
                    onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
                  />
                  <Button
                    variant={
                      isRecording && recordingField === "othersRemark"
                        ? "danger"
                        : "primary"
                    }
                    onClick={() => toggleRecording("othersRemark")}
                  >
                    <FontAwesomeIcon
                      icon={
                        isRecording && recordingField === "othersRemark"
                          ? faMicrophoneSlash
                          : faMicrophone
                      }
                    />
                  </Button>
                </InputGroup>
                {errors.othersRemark && (
                  <div className="text-danger">{errors.othersRemark}</div>
                )}
                {showSuggestions && activeSuggestionField === "othersRemark" && (
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
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) => (e.target.style.background = "#fff")}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </FormGroup>
            </Col>
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
                          background: "#fff",
                        }}
                        onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                        onMouseLeave={(e) => (e.target.style.background = "#fff")}
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
            <SaveButton type="submit" variant="success" className="me-3">
              <FaSave className="me-2" />
              {t("save")}
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

export default OtherReceipt;