
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
} from "../css/styles";
import { API_SERVICE } from "../../common/CommonMethod";
import { LIST_CLIENT_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FaSearch, FaTimes } from "react-icons/fa";
import { transliterateToTamil } from "../../common/transliteration";
import i18n from "../../../language/i18n";
import Header from "../../common/Header";
import EditCustomerModal from "../modal/EditCustomerModal ";


const ClientList = () => {
  const { t } = useTranslation();
  const [customerList, setCustomerList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [name, setName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [isActive, setIsActive] = useState("");
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
        id: null,
        customer_name: name,
        mobile: primaryPhone,
        isactive: isActive !== undefined ? isActive : null,
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
            onClick={() => {
              setEditingCustomerId(el.id);
              setShowEditModal(true);
            }}
          ></i>          
        </div>
      </td>
    </tr>
  ));

  const handleSaveEdit = () => {
    // Refresh the customer list after saving changes
    fetchCustomers();
  };

  return (
    <div>
      <Header
        titles={[t("clientList")]}
        links={[
          { to: "/purchase", label: t("addClient") },
          { to: "/dashboard", label: t("dashboard") },
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
                <Form.Group controlId="formPrimaryPhone">
                  <SearchLabel>{t("mobile_number")}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t("mobile_number")}
                      value={primaryPhone}
                      onChange={(e) => handleChange(e, setPrimaryPhone)}
                    />
                    <Button
                      variant={
                        isRecording && recordingField === "primaryPhone"
                          ? "danger"
                          : "primary"
                      }
                      onClick={() =>
                        toggleRecording("primaryPhone", setPrimaryPhone)
                      }
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
              <Col xs={12} md={4}>
                <Form.Group controlId="formIsActive">
                  <SearchLabel>{t("active")}</SearchLabel>
                  <Form.Control
                    as="select"
                    value={isActive}
                    onChange={(e) => setIsActive(e.target.value)}
                  >
                    <option value="">{t("select")}</option>
                    <option value="true">{t("yes")}</option>
                    <option value="false">{t("no")}</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
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
          <ClientTable responsive striped bordered hover>
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("mobile_number")}</th>
                <th>{t("whatsapp")}</th>
                <th>{t("active")}</th>
                <th className="text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>{customerList.length > 0 ? (
                list
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    {t("noData")}
                  </td>
                </tr>
              )}</tbody>
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
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
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
        </Col>
      </Row>
      <EditCustomerModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        customerId={editingCustomerId}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ClientList;
