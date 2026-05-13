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
  Modal,
  Table,
  Spinner,
  Alert
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaFileImport,
  FaDownload,
  FaUpload,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPlus,
  FaTrash,
  FaEdit,
  FaTable
} from "react-icons/fa";
import "./css/Transaction.css";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { API_SERVICE } from "../common/CommonMethod";
import { SAVE_NEW_TRANS_API } from "../common/CommonApiURL";
import Header from "../common/Header";
import { SaveButton, ClearButton } from "./css/styles";
import Translator from "../common/TranslationBasedOnLanguage";
import Tesseract from 'tesseract.js';

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
  const { t, i18n } = useTranslation();
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
  const [showDetails, setShowDetails] = useState(false);

  // Import related states
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedRecords, setExtractedRecords] = useState([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectAll, setSelectAll] = useState(true);
  const [isImportSaving, setIsImportSaving] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualRecords, setManualRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({
    name: '',
    villageName: '',
    amount: '',
    oldAmount: '',
    newAmount: '',
    initial: '',
    phoneNo: '',
    remarks: ''
  });

  // Refs for form controls
  const villageNameRef = useRef(null);
  const nameRef = useRef(null);
  const initialRef = useRef(null);
  const oldAmountRef = useRef(null);
  const newAmountRef = useRef(null);
  const amountRef = useRef(null);
  const phoneNoRef = useRef(null);
  const remarksRef = useRef(null);
  const fileInputRef = useRef(null);

  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);

  // useEffect hooks
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

  // Core functions
  const fetchSuggestions = async (text, fieldName) => {
    const langCode = (i18n && i18n.language ? String(i18n.language).split("-")[0] : "en");
    const supported = new Set(["ta", "hi", "ml", "te", "kn"]);

    if (!autoTranslateEnabled || !text.trim() || !supported.has(langCode)) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    try {
      const itc = `${langCode}-t-i0-und`;
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=5`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && Array.isArray(data[1]) && data[1][0] && Array.isArray(data[1][0][1])) {
        setSuggestions(data[1][0][1]);
        setActiveSuggestionField(fieldName);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      toast.error("Failed to fetch suggestions. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (["villageName", "name", "initial", "remarks"].includes(name)) {
      if (!autoTranslateEnabled || !value.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionField(null);
        setSelectedSuggestionIndex(-1);
      } else {
        setActiveSuggestionField(name);
        fetchSuggestions(value, name);
      }
    }

    if (value.endsWith(" ")) {
      setFieldBeingTranslated(name);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
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

  const handleKeyDown = (e, nextRef) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > -1 ? prev - 1 : prev));
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionField(null);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const startRecording = (fieldName) => {
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

  // Manual Entry Functions - MOVED OUTSIDE fetchSuggestions
  const addManualRecord = () => {
    if (!currentRecord.name || !currentRecord.villageName) {
      toast.error("Please enter at least Name and Village");
      return;
    }

    const userDetail = JSON.parse(localStorage.getItem("user"));
    const newRecord = {
      id: Date.now() + Math.random() * 1000,
      name: currentRecord.name,
      villageName: currentRecord.villageName,
      amount: parseFloat(currentRecord.amount) || 0,
      oldAmount: parseFloat(currentRecord.oldAmount) || 0,
      newAmount: parseFloat(currentRecord.newAmount) || 0,
      initial: currentRecord.initial || "",
      phoneNo: currentRecord.phoneNo || "",
      remarks: currentRecord.remarks || "",
      isSelected: true,
      customerId: userDetail?.customerID || 0,
      functionId: userDetail?.functionId || 0,
      createdBy: String(userDetail?.id || "SYSTEM"),
      createdDt: new Date().toISOString(),
      updatedBy: String(userDetail?.id || "SYSTEM"),
      updatedDt: new Date().toISOString(),
      isActive: true,
      type: "R",
      returnStatus: "N",
      returnRemark: ""
    };

    setManualRecords([...manualRecords, newRecord]);
    setCurrentRecord({
      name: '',
      villageName: '',
      amount: '',
      oldAmount: '',
      newAmount: '',
      initial: '',
      phoneNo: '',
      remarks: ''
    });
    toast.success("Record added successfully");
  };

  const removeManualRecord = (recordId) => {
    setManualRecords(manualRecords.filter(record => record.id !== recordId));
  };

  const confirmManualRecords = () => {
    if (manualRecords.length === 0) {
      toast.error("No records to import");
      return;
    }
    setExtractedRecords(manualRecords);
    setShowManualEntry(false);
    setManualRecords([]);
    toast.success(`${manualRecords.length} records ready for import`);
  };

  // Import functions
  const extractTextFromImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageData = e.target.result;
          const img = new Image();
          img.src = imageData;

          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageDataObj.data;
          for (let i = 0; i < data.length; i += 4) {
            const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
            data[i] = brightness;
            data[i + 1] = brightness;
            data[i + 2] = brightness;
            const contrast = 1.5;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
          }

          ctx.putImageData(imageDataObj, 0, 0);
          const processedImageData = canvas.toDataURL();

          const result = await Tesseract.recognize(
            processedImageData,
            'tam+eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setProcessingProgress(Math.floor(m.progress * 100));
                }
              },
              tessedit_pageseg_mode: 6, // Uniform block
              preserve_interword_spaces: 1
            }
          );

          const englishResult = await Tesseract.recognize(
            processedImageData,
            'eng',
            {
              logger: (m) => {
                if (m.status === 'recognizing text') {
                }
              }
            }
          );

          const combinedText = result.data.text + '\n' + englishResult.data.text;
          resolve(combinedText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const parseRecordsFromText = (text) => {
    const records = [];
    const lines = text.split('\n').filter(line => line.trim());

    const patterns = [
      /(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(\d+(?:\.\d+)?)/i,
      /(.+?)\s*:\s*(.+?)\s*:\s*(\d+(?:\.\d+)?)/i,
      /(.+?)\s*\|\s*(.+?)\s*\|\s*(\d+(?:\.\d+)?)/i,
      /(\w+(?:\s+\w+)*)\s+(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)/i
    ];

    for (const line of lines) {
      let parsed = false;

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          let [, name, village, amount] = match;
          records.push({
            id: Date.now() + Math.random() * 1000,
            name: name.trim(),
            villageName: village.trim(),
            amount: parseFloat(amount),
            oldAmount: 0,
            newAmount: 0,
            initial: "",
            phoneNo: "",
            remarks: "",
            isSelected: true,
            originalText: line
          });
          parsed = true;
          break;
        }
      }

      if (!parsed && line.trim()) {
        records.push({
          id: Date.now() + Math.random() * 1000,
          name: line.trim().substring(0, 50),
          villageName: "",
          amount: 0,
          oldAmount: 0,
          newAmount: 0,
          initial: "",
          phoneNo: "",
          remarks: line.trim(),
          isSelected: true,
          originalText: line
        });
      }
    }

    return records;
  };

  const processAmountDistribution = (records) => {
    return records.map(record => {
      if (record.amount > 0) {
        return {
          ...record,
          newAmount: record.amount,
          oldAmount: 0,
          amount: record.amount
        };
      } else if (record.amount < 0) {
        return {
          ...record,
          oldAmount: Math.abs(record.amount),
          newAmount: 0,
          amount: 0
        };
      }
      return record;
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, JPG)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should be less than 10MB");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const extractedText = await extractTextFromImage(file);
      let parsedRecords = parseRecordsFromText(extractedText);
      parsedRecords = processAmountDistribution(parsedRecords);

      const userDetail = JSON.parse(localStorage.getItem("user"));
      parsedRecords = parsedRecords.map(record => ({
        ...record,
        customerId: userDetail?.customerID || 0,
        functionId: userDetail?.functionId || 0,
        createdBy: String(userDetail?.id || "SYSTEM"),
        createdDt: new Date().toISOString(),
        updatedBy: String(userDetail?.id || "SYSTEM"),
        updatedDt: new Date().toISOString(),
        isActive: true,
        type: "R",
        returnStatus: "N",
        returnRemark: ""
      }));

      setExtractedRecords(parsedRecords);
      toast.success(`Successfully extracted ${parsedRecords.length} records from image`);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const toggleRecordSelection = (recordId) => {
    setExtractedRecords(prevRecords =>
      prevRecords.map(record =>
        record.id === recordId
          ? { ...record, isSelected: !record.isSelected }
          : record
      )
    );
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setExtractedRecords(prevRecords =>
      prevRecords.map(record => ({ ...record, isSelected: newSelectAll }))
    );
  };

  const handleRecordEdit = (recordId, field, value) => {
    setExtractedRecords(prevRecords =>
      prevRecords.map(record => {
        if (record.id === recordId) {
          const updatedRecord = { ...record, [field]: value };

          if (field === 'oldAmount' || field === 'newAmount') {
            updatedRecord.amount = Number(updatedRecord.oldAmount) + Number(updatedRecord.newAmount);
          }

          return updatedRecord;
        }
        return record;
      })
    );
  };

  const saveImportedRecords = async () => {
    const selectedRecords = extractedRecords.filter(record => record.isSelected);

    if (selectedRecords.length === 0) {
      toast.error("No records selected for import");
      return;
    }

    setIsImportSaving(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const record of selectedRecords) {
        const validationRecord = {
          ...record,
          villageName: record.villageName || "Unknown",
          name: record.name || "Unknown"
        };

        try {
          await schema.validate(validationRecord, { abortEarly: false });

          const saveData = {
            id: 0,
            customerId: record.customerId,
            villageName: record.villageName,
            initial: record.initial || "",
            name: record.name,
            oldAmount: record.oldAmount || 0,
            newAmount: record.newAmount || 0,
            amount: record.amount || (record.oldAmount + record.newAmount),
            remarks: record.remarks || "",
            phoneNo: record.phoneNo || "",
            createdBy: record.createdBy,
            createdDt: record.createdDt,
            updatedBy: record.updatedBy,
            updatedDt: record.updatedDt,
            isActive: true,
            type: "R",
            returnStatus: "N",
            returnRemark: "",
            functionId: record.functionId
          };

          await API_SERVICE.post(SAVE_NEW_TRANS_API, saveData);
          successCount++;
        } catch (error) {
          console.error("Error saving record:", error);
          errorCount++;

          if (error.inner) {
            const validationErrors = error.inner.map(e => e.message).join(", ");
            toast.error(`Validation failed for record "${record.name}": ${validationErrors}`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} records${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        setShowImportModal(false);
        resetImportStates();
      } else {
        toast.error("Failed to import records. Please check the data and try again.");
      }
    } catch (error) {
      console.error("Error in bulk save:", error);
      toast.error("An error occurred while saving records. Please try again.");
    } finally {
      setIsImportSaving(false);
    }
  };

  const resetImportStates = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedRecords([]);
    setSelectAll(true);
    setProcessingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const calculateTotalAmount = () => {
    return extractedRecords
      .filter(record => record.isSelected)
      .reduce((total, record) => total + (record.amount || 0), 0);
  };

  const calculateTotalRecords = () => {
    return extractedRecords.filter(record => record.isSelected).length;
  };

  const downloadTemplate = () => {
    const template = [
      ["Name", "Village", "Amount", "Old Amount", "New Amount", "Initial", "Phone No", "Remarks"],
      ["John Doe", "Main Street", "1000", "", "", "JD", "1234567890", "Sample remark"],
      ["Jane Smith", "Park Avenue", "", "500", "500", "JS", "0987654321", "Another sample"]
    ];

    const csvContent = template.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded successfully");
  };

  const handleClear = () => {
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
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Form.Check
            type="switch"
            id="autoTranslateSwitch"
            label="Enable Translation suggestions"
            checked={autoTranslateEnabled}
            onChange={() => {
              setAutoTranslateEnabled(!autoTranslateEnabled);
              if (!autoTranslateEnabled) {
                setSuggestions([]);
                setShowSuggestions(false);
                setActiveSuggestionField(null);
                setSelectedSuggestionIndex(-1);
              }
            }}
          />
          <div>
            <Button
              variant="info"
              onClick={downloadTemplate}
              className="me-2"
              title="Download CSV Template"
            >
              <FaDownload className="me-2" />
              Download Template
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowImportModal(true)}
              title="Import from Image"
            >
              <FaFileImport className="me-2" />
              Import
            </Button>
          </div>
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
                    {lastRecord.transaction?.villageName}
                  </Col>
                </Row>
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("name")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction?.name}
                  </Col>
                </Row>
                <Row className="mb-2 row-border">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("amount")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {lastRecord.transaction?.amount}
                  </Col>
                </Row>
                <Row className="mb-2 row-border align-items-center">
                  <Col xs={6} className="text-primary col-border d-flex justify-content-between">
                    <strong>{t("totalRecord")}:</strong>
                    <span
                      onClick={() => setShowDetails(!showDetails)}
                      style={{ cursor: "pointer" }}
                      title={showDetails ? t("hide") : t("show")}
                    >
                      {showDetails ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {showDetails ? lastRecord.totalTrans : "•••••"}
                  </Col>
                </Row>

                <Row className="mb-2 align-items-center">
                  <Col xs={6} className="text-primary col-border">
                    <strong>{t("totalAmount")}:</strong>
                  </Col>
                  <Col xs={6} className="text-secondary">
                    {showDetails ? lastRecord.totalAmount : "•••••"}
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
                    <FaMicrophone />
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
                    <FaMicrophone />
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
                    <FaMicrophone />
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
                    <FaMicrophone />
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
                    <FaMicrophone />
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
                    disabled
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
                    <FaMicrophone />
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
                    <FaMicrophone />
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

      {/* Enhanced Import Modal with Tabs */}
      <Modal
        show={showImportModal}
        onHide={() => {
          setShowImportModal(false);
          resetImportStates();
          setShowManualEntry(false);
          setManualRecords([]);
        }}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileImport className="me-2" />
            Import Data
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Tab Navigation */}
          <div className="mb-3">
            <Button
              variant={!showManualEntry ? "primary" : "outline-secondary"}
              onClick={() => setShowManualEntry(false)}
              className="me-2"
            >
              <FaUpload className="me-2" />
              OCR Import (Image)
            </Button>
            <Button
              variant={showManualEntry ? "primary" : "outline-secondary"}
              onClick={() => setShowManualEntry(true)}
            >
              <FaTable className="me-2" />
              Manual Entry
            </Button>
          </div>

          {!showManualEntry ? (
            // OCR Import Section
            !extractedRecords.length && !isProcessing ? (
              <div className="text-center p-4">
                <div className="mb-4">
                  <FaUpload size={48} className="text-muted mb-3" />
                  <h5>Upload Image with Transaction Data</h5>
                  <p className="text-muted">
                    Upload a clear image containing transaction details in Tamil, English, or Malayalam.
                    <br />
                    <strong>Note:</strong> For handwritten Tamil text, please use Manual Entry for better accuracy.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="d-none"
                  id="imageUploadInput"
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current.click()}
                  className="me-2"
                >
                  <FaUpload className="me-2" />
                  Select Image
                </Button>
                <Button
                  variant="outline-info"
                  onClick={downloadTemplate}
                >
                  <FaDownload className="me-2" />
                  Download Template
                </Button>
                <div className="mt-3">
                  <small className="text-muted">
                    Supported formats: JPEG, PNG, JPG (Max 10MB)
                  </small>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <h5>Processing Image...</h5>
                <p className="text-muted">Extracting text and parsing records</p>
                <div className="progress mt-3">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${processingProgress}%` }}
                  >
                    {processingProgress}%
                  </div>
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "20px" }}
                    className="img-thumbnail"
                  />
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <Alert variant="info" className="mb-3">
                  <Row>
                    <Col md={4}>
                      <strong>Total Records:</strong> {extractedRecords.length}
                    </Col>
                    <Col md={4}>
                      <strong>Selected Records:</strong> {calculateTotalRecords()}
                    </Col>
                    <Col md={4}>
                      <strong>Total Amount:</strong> ₹{calculateTotalAmount().toLocaleString()}
                    </Col>
                  </Row>
                </Alert>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>S.No</th>
                      <th>Name *</th>
                      <th>Village *</th>
                      <th>Initial</th>
                      <th>Old Amount</th>
                      <th>New Amount</th>
                      <th>Total Amount</th>
                      <th>Phone No</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedRecords.map((record, index) => (
                      <tr key={record.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={record.isSelected}
                            onChange={() => toggleRecordSelection(record.id)}
                          />
                        </td>
                        <td>{index + 1}</td>
                        <td>
                          <FormControl
                            type="text"
                            value={record.name}
                            onChange={(e) => handleRecordEdit(record.id, "name", e.target.value)}
                            size="sm"
                          />
                        </td>
                        <td>
                          <FormControl
                            type="text"
                            value={record.villageName}
                            onChange={(e) => handleRecordEdit(record.id, "villageName", e.target.value)}
                            size="sm"
                          />
                        </td>
                        <td>
                          <FormControl
                            type="text"
                            value={record.initial}
                            onChange={(e) => handleRecordEdit(record.id, "initial", e.target.value)}
                            size="sm"
                          />
                        </td>
                        <td>
                          <FormControl
                            type="number"
                            value={record.oldAmount}
                            onChange={(e) => handleRecordEdit(record.id, "oldAmount", parseFloat(e.target.value) || 0)}
                            size="sm"
                          />
                        </td>
                        <td>
                          <FormControl
                            type="number"
                            value={record.newAmount}
                            onChange={(e) => handleRecordEdit(record.id, "newAmount", parseFloat(e.target.value) || 0)}
                            size="sm"
                          />
                        </td>
                        <td>{record.amount}</td>
                        <td>
                          <FormControl
                            type="text"
                            value={record.phoneNo}
                            onChange={(e) => handleRecordEdit(record.id, "phoneNo", e.target.value)}
                            size="sm"
                          />
                        </td>
                        <td>
                          <FormControl
                            type="text"
                            value={record.remarks}
                            onChange={(e) => handleRecordEdit(record.id, "remarks", e.target.value)}
                            size="sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )
          ) : (
            // Manual Entry Section
            <div>
              <Alert variant="info" className="mb-3">
                <strong>Manual Data Entry</strong>
                <br />
                Enter transaction details manually. You can add multiple records before importing.
              </Alert>

              {/* Manual Entry Form */}
              <Card className="mb-3">
                <CardBody>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <FormLabel>Name *</FormLabel>
                        <FormControl
                          type="text"
                          placeholder="Enter name"
                          value={currentRecord.name}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, name: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <FormLabel>Village *</FormLabel>
                        <FormControl
                          type="text"
                          placeholder="Enter village"
                          value={currentRecord.villageName}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, villageName: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <FormLabel>Amount</FormLabel>
                        <FormControl
                          type="number"
                          placeholder="Amount"
                          value={currentRecord.amount}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, amount: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <FormLabel>Initial</FormLabel>
                        <FormControl
                          type="text"
                          placeholder="Initial"
                          value={currentRecord.initial}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, initial: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <FormLabel>Phone No</FormLabel>
                        <FormControl
                          type="text"
                          placeholder="Phone"
                          value={currentRecord.phoneNo}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, phoneNo: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <FormGroup>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl
                          type="text"
                          placeholder="Remarks"
                          value={currentRecord.remarks}
                          onChange={(e) => setCurrentRecord({ ...currentRecord, remarks: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6} className="d-flex align-items-end">
                      <Button variant="success" onClick={addManualRecord}>
                        <FaPlus className="me-2" />
                        Add Record
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {/* Manual Records Table */}
              {manualRecords.length > 0 && (
                <>
                  <h6>Records to Import ({manualRecords.length})</h6>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Village</th>
                          <th>Amount</th>
                          <th>Initial</th>
                          <th>Phone</th>
                          <th>Remarks</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualRecords.map((record, idx) => (
                          <tr key={record.id}>
                            <td>{idx + 1}</td>
                            <td>{record.name}</td>
                            <td>{record.villageName}</td>
                            <td>₹{record.amount}</td>
                            <td>{record.initial}</td>
                            <td>{record.phoneNo}</td>
                            <td>{record.remarks}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeManualRecord(record.id)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowImportModal(false);
            resetImportStates();
            setShowManualEntry(false);
            setManualRecords([]);
          }}>
            Cancel
          </Button>
          {!showManualEntry ? (
            extractedRecords.length > 0 && !isProcessing && (
              <>
                <Button variant="outline-primary" onClick={downloadTemplate}>
                  <FaDownload className="me-2" />
                  Download Template
                </Button>
                <Button variant="outline-secondary" onClick={() => fileInputRef.current.click()}>
                  <FaUpload className="me-2" />
                  Upload Different Image
                </Button>
                <Button
                  variant="success"
                  onClick={saveImportedRecords}
                  disabled={isImportSaving || calculateTotalRecords() === 0}
                >
                  {isImportSaving ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />
                      Save Selected ({calculateTotalRecords()})
                    </>
                  )}
                </Button>
              </>
            )
          ) : (
            <Button
              variant="success"
              onClick={confirmManualRecords}
              disabled={manualRecords.length === 0}
            >
              <FaSave className="me-2" />
              Import {manualRecords.length} Record(s)
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Transaction;