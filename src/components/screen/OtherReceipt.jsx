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
import { transliterateToTamil } from "../common/transliteration";
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
    others:yup.number("Please Enter Number only"),
    phoneNo: yup.string().matches(/^\d*$/, "Please Enter Valid Number"),
    remarks: yup.string(),
  })
  .test(
    "either-old-or-new-amount",
    "Either old amount or new amount is required and must be greater than zero",
    function (values) {
      const { oldAmount, newAmount } = values;
      // Check if at least one of the fields is provided and greater than zero
      return (oldAmount && oldAmount > 0) || (newAmount && newAmount > 0);
    }
  );

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
    others:1,
    othersType:"",
    othersRemark:""
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [lastRecord, setLastRecord] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

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
        createdBy:String(userDetail.id),
        updatedBy:String(userDetail.id)
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
        console.log(formData, "payload");
      await schema.validate(formData, { abortEarly: false });
      console.log(formData, "payload");
      API_SERVICE.post(SAVE_NEW_TRANS_API, formData)
        .then(async (response) => {
          if (response.data.result) {
            // Fetch updated last record
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
              type: "",
              returnRemark: "",
              functionId: userDetail.functionId,
            });
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
        bgColor='#FFD700' // Custom background color for Header
      />
      <CardBody>
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
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="oldAmount">
                <FormLabel>
                  {t("others")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="number"
                    placeholder={t("enter_amount")}
                    name="oldAmount"
                    value={formData.others}
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
                {errors.others && (
                  <div className="text-danger">{errors.others}</div>
                )}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="newAmount">
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
                <FormLabel>
                  {t("othersRemarks")}
                  <span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    as="textarea" 
                    placeholder={t("enter_description_detail")}
                    name="othersRemark"
                    value={formData.othersRemark}
                    onChange={handleChange}
                    ref={amountRef}
                    onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
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
                {errors.othersRemarks && (
                  <div className="text-danger">{errors.othersRemarks}</div>
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
              </FormGroup>
            </Col>
          </Row>
           {/* Translator Component */}
           <Translator
              inputText={formData[fieldBeingTranslated] || ""}
              onTranslated={handleTranslation}
              sourceLanguage="en"
              targetLanguage= {i18n.language ||"en" }
            />
          <div className="d-flex justify-content-center mt-3">
            <SaveButton type="submit" variant="success" className="me-3">
              <FaSave className="me-2" />
              {t("save")}
            </SaveButton>
            <ClearButton type="button" variant="secondary">
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
