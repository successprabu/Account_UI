import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import styled from "styled-components";
import { ClientTable } from "../css/styled";
import { API_SERVICE } from "../../common/CommonMethod";
import { DELETE_TRANSACTION_API, LIST_TRANSACTION_API, SAVE_NEW_TRANS_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess";
import { useNavigate } from "react-router-dom";
import TransDeleteModal from "../modal/TransDeleteModal";
import TransEditModal from "../modal/TransEditModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons";
import { transliterateToTamil } from "../../common/transliteration";
import i18n from "../../../language/i18n";

const SearchForm = styled(Form)`
  margin-bottom: 20px;
`;

const SearchInput = styled(Form.Control)`
  border: 1px solid #ced4da;
  border-radius: 0.60rem;
  padding: 0.375rem 0.95rem;
  font-size: 1rem;
  color: #0f66b7;
`;

const SearchButton = styled(Button)`
  font-size: 1rem;
  width: 100%;
  @media (min-width: 768px) {
    width: auto;
    margin-top: 31px;
  }
`;

const SearchLabel = styled(Form.Label)`
  color: #0e2238; 
`;

const onEdit = (id, transaction, setEditingTransaction, setShowEditModal) => {
  setEditingTransaction(transaction);
  setShowEditModal(true);
};

const onDelete = (id, setDeletingTransactionId, setShowDeleteModal) => {
  setDeletingTransactionId(id);
  setShowDeleteModal(true);
};

const TransactionList = () => {
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
  const navigate = useNavigate();

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
      });

      if (response.data.result) {
        setTransactionList(response.data.data);
      } else {
        console.error("No Records Found");
        return <p>{t('noData')}</p>;
      }
    } catch (error) {
      console.error("There was an error fetching the client list!", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleDelete = async () => {
    console.log(deletingTransactionId,"deteleid")
  
    try {
      const user = localStorage.getItem("user");
      await API_SERVICE.postreq(DELETE_TRANSACTION_API, {
        id: deletingTransactionId,
        deletedBy:JSON.parse(user).mobile??"system"
      });
      setTransactionList(transactionList.filter(t => t.id !== deletingTransactionId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("There was an error deleting the transaction!", error);
    }
  };

  const handleEditSave = async () => {
    try {
      await API_SERVICE.post(SAVE_NEW_TRANS_API, editingTransaction);
      setTransactionList(transactionList.map(t => (t.id === editingTransaction.id ? editingTransaction : t)));
      setShowEditModal(false);
    } catch (error) {
      console.error("There was an error editing the transaction!", error);
    }
  };

  const handleChange = (e, setState) => {
    const { value } = e.target;

    setState(value);

    if (i18n.language === 'ta' && value.endsWith(' ')) {
      setState(transliterateToTamil(value.trim()));
    }
  };

  const startRecording = (fieldName, setState) => {
    setIsRecording(true);
    setRecordingField(fieldName);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = i18n.language === 'ta' ? 'ta-IN' : 'en-US';
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

  const list = transactionList.map((el) => (
    <tr key={el.id}>
      <td>{el.villageName}</td>
      <td>{el.name}</td>
      <td>{el.amount}</td>
      <td>{el.phoneNo}</td>
      <td>{el.isActive ? t('yes') : t('no')}</td>
      <td>
        <div className="d-flex justify-content-end">
          <i
            className="fa-solid fa-pen-to-square text-primary me-2"
            role="presentation"
            title={t('edit')}
            onClick={() => onEdit(el.id, el, setEditingTransaction, setShowEditModal)}
          ></i>
          <i
            className="fa-solid fa-trash text-danger me-2"
            role="presentation"
            title={t('delete')}
            onClick={() => onDelete(el.id, setDeletingTransactionId, setShowDeleteModal)}
          />
        </div>
      </td>
    </tr>
  ));

  return (
    <div>
      <Row>
        <Col>
          <SearchForm onSubmit={handleSearch} className="mb-3">
            <Row className="align-items-end">
              <Col xs={12} md={4}>
                <Form.Group controlId="formName">
                  <SearchLabel>{t('name')}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t('name')}
                      value={name}
                      onChange={(e) => handleChange(e, setName)}
                    />
                    <Button variant={isRecording && recordingField === 'name' ? "danger" : "primary"} onClick={() => toggleRecording('name', setName)}>
                      <FontAwesomeIcon icon={isRecording && recordingField === 'name' ? faMicrophoneSlash : faMicrophone} />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formPlaceName">
                  <SearchLabel>{t('placeName')}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t('placeName')}
                      value={placeName}
                      onChange={(e) => handleChange(e, setPlaceName)}
                    />
                    <Button variant={isRecording && recordingField === 'placeName' ? "danger" : "primary"} onClick={() => toggleRecording('placeName', setPlaceName)}>
                      <FontAwesomeIcon icon={isRecording && recordingField === 'placeName' ? faMicrophoneSlash : faMicrophone} />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="formMobile">
                  <SearchLabel>{t('phoneNo')}</SearchLabel>
                  <InputGroup>
                    <SearchInput
                      type="text"
                      placeholder={t('phoneNo')}
                      value={mobile}
                      onChange={(e) => handleChange(e, setMobile)}
                    />
                    <Button variant={isRecording && recordingField === 'mobile' ? "danger" : "primary"} onClick={() => toggleRecording('mobile', setMobile)}>
                      <FontAwesomeIcon icon={isRecording && recordingField === 'mobile' ? faMicrophoneSlash : faMicrophone} />
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12} className="d-flex justify-content-center">
                <SearchButton type="submit">{t('search')}</SearchButton>
              </Col>
            </Row>
          </SearchForm>
          <ClientTable responsive bordered className="mt-4">
            <thead>
              <tr>
                <th>{t('placeName')}</th>
                <th>{t('name')}</th>
                <th>{t('amount')}</th>
                <th>{t('phoneNo')}</th>
                <th>{t('active')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </ClientTable>
        </Col>
      </Row>
      <TransDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />
      <TransEditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSave={handleEditSave}
        transaction={editingTransaction}
        setTransaction={setEditingTransaction}
      />
    </div>
  );
};

export default TransactionList;
