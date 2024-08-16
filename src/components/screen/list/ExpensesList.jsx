import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  InputGroup,
  Pagination,
  Form,
  Button,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  ClientTable,
  SearchButton,
  SearchForm,
  SearchInput,
  SearchLabel,
  PageSizeWrapper,
  PageSizeSelect,
  PaginationWrapper,
  ClearButton,
  TotalRow,
} from "../css/styles";
import { API_SERVICE } from "../../common/CommonMethod";
import {
  DELETE_TRANSACTION_API,
  LIST_TRANSACTION_API,
  SAVE_NEW_TRANS_API,
} from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess";
import TransDeleteModal from "../modal/TransDeleteModal";
import TransEditModal from "../modal/TransEditModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FaSearch, FaTimes } from "react-icons/fa";
import i18n from "../../../language/i18n";
import Header from "../../common/Header";
import Translator from "../../common/TranslationBasedOnLanguage";

const onEdit = (id, transaction, setEditingTransaction, setShowEditModal) => {
  setEditingTransaction(transaction);
  setShowEditModal(true);
};

const onDelete = (id, setDeletingTransactionId, setShowDeleteModal) => {
  setDeletingTransactionId(id);
  setShowDeleteModal(true);
};

const ExpensesList = () => {
  const { t } = useTranslation();
  const [transactionList, setTransactionList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [mobile, setMobile] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [fieldBeingTranslated, setFieldBeingTranslated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await API_SERVICE.get(LIST_TRANSACTION_API, {
        customer_id: JSON.parse(user).customerID,
        id: null,
        customer_name: name,
        village_name: placeName,
        mobile: mobile,
        current_page: currentPage,
        page_size: pageSize,
      });

      if (response.data.result) {
        setTransactionList(response.data.data.transactions);
        setTotalPages(response.data.data.totalPages);
      } else {
        console.error("No Records Found");
        return <p>{t("noData")}</p>;
      }
    } catch (error) {
      console.error("There was an error fetching the client list!", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleClear = () => {
    setMobile("");
    setName("");
    setPlaceName("");
  };

  const handleDelete = async () => {
    console.log(deletingTransactionId, "deteleid");

    try {
      const user = localStorage.getItem("user");
      await API_SERVICE.postreq(DELETE_TRANSACTION_API, {
        id: deletingTransactionId,
        deletedBy: JSON.parse(user).mobile ?? "system",
      });
      setTransactionList(
        transactionList.filter((t) => t.id !== deletingTransactionId)
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("There was an error deleting the transaction!", error);
    }
  };

  const handleEditSave = async () => {
    try {
      await API_SERVICE.post(SAVE_NEW_TRANS_API, editingTransaction);
      setTransactionList(
        transactionList.map((t) =>
          t.id === editingTransaction.id ? editingTransaction : t
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error("There was an error editing the transaction!", error);
    }
  };

  const handleTranslation = (translatedText) => {
    if (fieldBeingTranslated) {
      if (fieldBeingTranslated === "name") {
        setName(translatedText);
      } else if (fieldBeingTranslated === "placeName") {
        setPlaceName(translatedText);
      } else if (fieldBeingTranslated === "mobile") {
        setMobile(translatedText);
      }
      setFieldBeingTranslated(null);
    }
  };
  
  const handleChange = (e, setState, fieldName) => {
    const { value } = e.target;
    setState(value);
  
    if (value.endsWith(" ")) {
      setFieldBeingTranslated(fieldName);
      // Initiate translation
      handleTranslation(value.trim());
    }
  };
  const startRecording = (fieldName, setState) => {
    setIsRecording(true);
    setRecordingField(fieldName);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = i18n.language === "ta" ? "ta-IN" : "en-US";
    recognitionRef.current.onresult = (event) => {
      setState(event.results[0][0].transcript);
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

  const toggleRecording = (fieldName, setState) => {
    if (isRecording && recordingField === fieldName) {
      stopRecording();
    } else {
      startRecording(fieldName, setState);
    }
  };

  if (!isAuthenticated) {
    return <UnauthorizedAccess />;
  }

  const calculateTotals = () => {
    const totalAmount = transactionList.reduce(
      (acc, trans) => acc + parseFloat(trans.amount || 0),0 );
    const totalRows = transactionList.length;
    return { totalAmount, totalRows };
  };

  const { totalAmount, totalRows } = calculateTotals();
  const list = transactionList.map((el) => (
    <tr key={el.id}>
      <td>{el.villageName}</td>
      <td>{el.name}</td>
      <td>{el.amount}</td>
      <td>{el.phoneNo}</td>
      <td>{el.isActive ? t("yes") : t("no")}</td>
      <td>
        <div className="d-flex justify-content-end align-items-center">
          <i
            className="fa-solid fa-pen-to-square text-primary me-2"
            role="presentation"
            title={t("edit")}
            onClick={() =>
              onEdit(el.id, el, setEditingTransaction, setShowEditModal)
            }
          ></i>
          <i
            className="fa-solid fa-trash text-danger me-2"
            role="presentation"
            title={t("delete")}
            onClick={() =>
              onDelete(el.id, setDeletingTransactionId, setShowDeleteModal)
            }
          />
        </div>
      </td>
    </tr>
  ));

  return (
    <div>
      {/* <Header title={t("transactionList")} links={[{to: "/transaction", label: t("addTransaction")}]} /> */}
      <Header
        //titles={[t("transactionList"), t("anotherTitle")]}
        titles={[t("expensesList")]}
        links={[
            { to: "/dashboard", label: t("dashboard") },
          { to: "/addExpenses", label: t("addExpenses") }
         
        ]}
      />
      <Row>
        <Col>
          <SearchForm onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-end">
              <Col xs={12} md={4}>
                <Form.Group controlId="formName">
                  <SearchLabel>{t("name")}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t("name")}
                      value={name}
                      onChange={(e) => handleChange(e, setName)}
                    />
                    <Button
                      variant={
                        isRecording && recordingField === "name"
                          ? "danger"
                          : "primary"
                      }
                      onClick={() => toggleRecording("name", setName)}
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
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formPlaceName">
                  <SearchLabel>{t("placeName")}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t("placeName")}
                      value={placeName}
                      onChange={(e) => handleChange(e, setPlaceName)}
                    />
                    <Button
                      variant={
                        isRecording && recordingField === "placeName"
                          ? "danger"
                          : "primary"
                      }
                      onClick={() => toggleRecording("placeName", setPlaceName)}
                    >
                      <FontAwesomeIcon
                        icon={
                          isRecording && recordingField === "placeName"
                            ? faMicrophoneSlash
                            : faMicrophone
                        }
                      />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formMobile">
                  <SearchLabel>{t("mobile")}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t("mobile")}
                      value={mobile}
                      onChange={(e) => handleChange(e, setMobile)}
                    />
                    <Button
                      variant={
                        isRecording && recordingField === "mobile"
                          ? "danger"
                          : "primary"
                      }
                      onClick={() => toggleRecording("mobile", setMobile)}
                    >
                      <FontAwesomeIcon
                        icon={
                          isRecording && recordingField === "mobile"
                            ? faMicrophoneSlash
                            : faMicrophone
                        }
                      />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
           {/* Translator Component */}
           {fieldBeingTranslated && (
            <Translator
              inputText={name || placeName || mobile}
              onTranslated={handleTranslation}
              sourceLanguage="en"
              targetLanguage={i18n.language || "en"}
            />
          )}
            <Row className="justify-content-center align-items-end">
              <Col xs={12} md={6} className="text-center">
                <div className="mb-0 d-flex justify-content-center align-items-center">
                  <SearchButton>
                    <FaSearch className="mr-2" /> {t("search")}
                  </SearchButton>
                  <ClearButton onClick={handleClear}>
                    <FaTimes className="mr-2" /> {t("clearButton")}
                  </ClearButton>
                </div>
              </Col>
              <PageSizeWrapper>
                <Form.Group controlId="formPageSize">
                  <SearchLabel>{t("pageSize")}</SearchLabel>
                  <PageSizeSelect
                    as="select"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </PageSizeSelect>
                </Form.Group>
              </PageSizeWrapper>
            </Row>
          </SearchForm>
        </Col>
      </Row>
      <ClientTable responsive className="table table-striped">
        <thead>
          <tr>
            <th>{t("placeName")}</th>
            <th>{t("name")}</th>
            <th>{t("amount")}</th>
            <th>{t("phoneNo")}</th>
            <th>{t("active")}</th>
            <th className="text-end">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
        {transactionList.length > 0 ? (
             <>
             {list}
             <TotalRow>
               <td colSpan="2">
                 {t("totalRows")}: {totalRows} {t("pagerows")}
               </td>
               <td>{totalAmount}</td>
             </TotalRow>
           </> ) : (
                <tr>
                  <td colSpan="6" className="text-center danger">
                    {t("noData")}
                  </td>
                </tr>
              )}
        </tbody>
      </ClientTable>
      
      <PaginationWrapper>
        <Pagination>
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </PaginationWrapper>

      <TransDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />
      <TransEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        transaction={editingTransaction}
        setTransaction={setEditingTransaction}
        onSave={handleEditSave}
      />
    </div>
  );
};

export default ExpensesList;
