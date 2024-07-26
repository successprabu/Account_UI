import React, { useEffect, useState, useRef } from "react";
import { Row, Col, InputGroup, Pagination, Form, Button } from "react-bootstrap";
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
import { LIST_CLIENT_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { FaSearch, FaTimes } from "react-icons/fa";
import { transliterateToTamil } from "../../common/transliteration";
import i18n from "../../../language/i18n";
import Header from "../../common/Header";

const onEdit = (id, customer, setEditingCustomer, setShowEditModal) => {
  setEditingCustomer(customer);
  setShowEditModal(true);
};

const onDelete = (id, setDeletingCustomerId, setShowDeleteModal) => {
  setDeletingCustomerId(id);
  setShowDeleteModal(true);
};

const ClientList = () => {
  const { t } = useTranslation();
  const [customerList, setCustomerList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [name, setName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await API_SERVICE.get(LIST_CLIENT_API, {
        customer_id: JSON.parse(user).customerID,
        id: null,
        customer_name: name,
        primary_phone: primaryPhone,
        current_page: currentPage,
        page_size: pageSize,
      });

      if (response.data.result) {
        setCustomerList(response.data.data.customers);
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
    fetchCustomers();
  }, [currentPage, pageSize]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleClear = () => {
    setPrimaryPhone("");
    setName("");
  };

  const handleChange = (e, setState) => {
    const { value } = e.target;

    setState(value);

    if (i18n.language === "ta" && value.endsWith(" ")) {
      setState(transliterateToTamil(value.trim()));
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

  // const calculateTotals = () => {
  //   const totalRows = customerList.length;
  //   return { totalRows };
  // };

  // const { totalRows } = calculateTotals();
  const list = customerList.map((el) => (
    <tr key={el.id}>
      <td>{el.name}</td>
      <td>{el.primary_phone}</td>
      <td>{el.is_primary_phone_whatsup ? t("yes") : t("no")}</td>
      <td>{el.isActive ? t("yes") : t("no")}</td>
      <td>
        <div className="d-flex justify-content-end">
          <i
            className="fa-solid fa-pen-to-square text-primary me-2"
            role="presentation"
            title={t("edit")}
            onClick={() =>
              onEdit(el.id, el, setEditingCustomer, setShowEditModal)
            }
          ></i>
          <i
            className="fa-solid fa-trash text-danger me-2"
            role="presentation"
            title={t("delete")}
            onClick={() =>
              onDelete(el.id, setDeletingCustomerId, setShowDeleteModal)
            }
          />
        </div>
      </td>
    </tr>
  ));

  return (
    <div>
      <Header
        titles={[t("clientList")]}
        links={[
          { to: "/dashboard", label: t("dashboard") },
          { to: "/client", label: t("addClient") },
        ]}
      />
      <Row>
        <Col>
          <SearchForm onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-end">
              <Col xs={12} md={6}>
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
              <Col xs={12} md={6}>
                <Form.Group controlId="formPrimaryPhone">
                  <SearchLabel>{t("primaryPhone")}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t("primaryPhone")}
                      value={primaryPhone}
                      onChange={(e) => handleChange(e, setPrimaryPhone)}
                    />
                    <Button
                      variant={
                        isRecording && recordingField === "primaryPhone"
                          ? "danger"
                          : "primary"
                      }
                      onClick={() => toggleRecording("primaryPhone", setPrimaryPhone)}
                    >
                      <FontAwesomeIcon
                        icon={
                          isRecording && recordingField === "primaryPhone"
                            ? faMicrophoneSlash
                            : faMicrophone
                        }
                      />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row className="justify-content-center align-items-end">
              <Col xs={12} md={6} className="text-center">
                <div className="mb-0">
                  <SearchButton variant="primary" type="submit">
                    <FaSearch className="mr-2" /> {t("search")}
                  </SearchButton>
                  <ClearButton
                    variant="secondary"
                    onClick={() => handleClear()}
                  >
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
          <ClientTable responsive striped bordered hover>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("primaryPhone")}</th>
                <th>{t("isPrimaryPhoneWhatsapp")}</th>
                <th>{t("isActive")}</th>
                <th className="text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
            {/* <tfoot>
              <tr>
                <td colSpan="5">
                  <TotalRow>{t("totalRows")}: {totalRows}</TotalRow>
                </td>
              </tr>
            </tfoot> */}
          </ClientTable>
          <PaginationWrapper>
            <Pagination>
              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </PaginationWrapper>
        </Col>
      </Row>
    </div>
  );
};

export default ClientList;
