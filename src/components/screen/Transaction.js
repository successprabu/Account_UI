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
  InputGroup
} from "react-bootstrap";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import i18n from "../../language/i18n";
import { transliterateToTamil } from "../common/transliteration";
import "./css/Transaction.css";
import { Link } from "react-router-dom";
import * as yup from "yup"; // Import yup for validation
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";

const schema = yup.object().shape({
  villageName: yup.string().required(),
  name: yup.string().required(),
  initial: yup.string().required(),
  amount: yup.number().required().positive(),
  phoneNo: yup.string().matches(/^\d*$/, 'Please Enter Valid Number'),
  remarks: yup.string()
});

const Transaction = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    villageName: "",
    initial: "",
    name: "",
    amount: 0,
    remarks: "",
    phoneNo: "",
    createdBy: "SYSTEM",
    createdDt: "2024-07-01T13:12:38.744Z",
    updatedBy: "SYSTEM",
    updatedDt: "2024-07-01T13:12:38.744Z",
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);

  // Refs for form controls
  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const amountRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const userDetail = localStorage.getItem("user");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (i18n.language === 'ta') {
      // Additional setup for Tamil language if needed
    }
  }, [i18n.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let transliteratedValue = value;

    if (i18n.language === 'ta') {
      transliteratedValue = transliterateToTamil(value);
    }

    setFormData({
      ...formData,
      [name]: transliteratedValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      await schema.validate(formData, { abortEarly: false });
      console.log('Payload:', formData); // Log payload to console
      console.log(SAVE_NEW_TRANS_API,'url')
  
      API_SERVICE.post(SAVE_NEW_TRANS_API, formData)
        .then((response) => {
          console.log(response.data,'response')
          if (response.data.result) {
            setFormData({
              id: 0,
              customerId: userDetail.id,
              villageName: "",
              initial: "",
              name: "",
              amount: 0,
              remarks: "",
              phoneNo: "",
              createdBy: "SYSTEM",
              createdDt: new Date().toISOString(),
              updateddBy: "SYSTEM",
              updatedDt: new Date().toISOString(),
              isActive: true
            });
            toast.success("Transaction Saved Successfully");
          } else {
            toast.error("Something went wrong on Transaction Save..pls Try Again");
          }
        })
        .catch((error) => {
          console.error('API call error:', error);
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
    if (e.key === 'Enter' || e.key === 'Tab') {
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
    recognitionRef.current.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
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
        {t("authentication_required")} <span className="text-primary"><Link to="/login">{t("login_here")}</Link></span>
      </div>
    );
  }

  return (
    <Card className="mt-1">
      <CardHeader>
        <h4 className="mb-0 text-primary">{t('Transactions')}</h4>
      </CardHeader>
      <CardBody>
        <Form className="text-primary w-100" onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="villageName">
                <FormLabel>
                  {t('village')}<span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_village')}
                    name="villageName"
                    id="villageName"
                    value={formData.villageName}
                    onChange={handleChange}
                    ref={villageNameRef}
                    onKeyDown={(e) => handleKeyDown(e, nameRef)}
                  />
                  <Button variant={isRecording && recordingField === 'villageName' ? "danger" : "primary"} onClick={() => toggleRecording('villageName')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'villageName' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.villageName && <div className="text-danger">{errors.villageName}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="name">
                <FormLabel>
                  {t('name')}<span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_name')}
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    ref={nameRef}
                    onKeyDown={(e) => handleKeyDown(e, initialRef)}
                  />
                  <Button variant={isRecording && recordingField === 'name' ? "danger" : "primary"} onClick={() => toggleRecording('name')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'name' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.name && <div className="text-danger">{errors.name}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="initial">
                <FormLabel>
                  {t('initial')}<span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_initial')}
                    name="initial"
                    id="initial"
                    value={formData.initial}
                    onChange={handleChange}
                    ref={initialRef}
                    onKeyDown={(e) => handleKeyDown(e, amountRef)}
                  />
                  <Button variant={isRecording && recordingField === 'initial' ? "danger" : "primary"} onClick={() => toggleRecording('initial')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'initial' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.initial && <div className="text-danger">{errors.initial}</div>}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={4}>
              <FormGroup controlId="amount">
                <FormLabel>
                  {t('amount')}<span className="text-danger">*</span>
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_amount')}
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    ref={amountRef}
                    onKeyDown={(e) => handleKeyDown(e, phoneNoRef)}
                  />
                  <Button variant={isRecording && recordingField === 'amount' ? "danger" : "primary"} onClick={() => toggleRecording('amount')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'amount' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.amount && <div className="text-danger">{errors.amount}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="phoneNo">
                <FormLabel>
                  {t('mobile')}
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_mobile')}
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    ref={phoneNoRef}
                    onKeyDown={(e) => handleKeyDown(e, remarksRef)}
                  />
                  <Button variant={isRecording && recordingField === 'phoneNo' ? "danger" : "primary"} onClick={() => toggleRecording('phoneNo')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'phoneNo' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.phoneNo && <div className="text-danger">{errors.phoneNo}</div>}
              </FormGroup>
            </Col>
            <Col xs={12} md={4}>
              <FormGroup controlId="remarks">
                <FormLabel>
                  {t('remarks')}
                </FormLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder={t('enter_remarks')}
                    name="remarks"
                    id="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    ref={remarksRef}
                    onKeyDown={(e) => handleKeyDown(e, villageNameRef)}
                  />
                  <Button variant={isRecording && recordingField === 'remarks' ? "danger" : "primary"} onClick={() => toggleRecording('remarks')}>
                    <FontAwesomeIcon icon={isRecording && recordingField === 'remarks' ? faMicrophoneSlash : faMicrophone} />
                  </Button>
                </InputGroup>
                {errors.remarks && <div className="text-danger">{errors.remarks}</div>}
              </FormGroup>
            </Col>
          </Row>

          <Button type="submit" variant="primary" className="me-3">
            {t('save')}
          </Button>
          <Button type="button" variant="danger">
            {t('cancel')}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default Transaction;
