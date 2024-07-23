import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col } from "react-bootstrap";
import { ClientTable } from "../css/styled";
import { API_SERVICE } from "../../common/CommonMethod";
import { LIST_TRANSACTION_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess"; 
import { useNavigate } from "react-router-dom";

const onEdit = (arg) => {
  console.log(arg);
};
const onDelete = (arg) => {
  console.log(arg);
};

const TransactionList = () => {
  const { t, i18n } = useTranslation();
  const [transactionList, setTransactionList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      return;
    }

    API_SERVICE.get(LIST_TRANSACTION_API)
      .then((response) => {
        if (response.data.result) {
          setTransactionList(response.data.data);
        } else {
          console.error("No Records Found");
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the client list!", error);
      });
  }, []); 

  if (!isAuthenticated) {
    return <UnauthorizedAccess />;
  }

  if (transactionList.length === 0) return <p>{t('noData')}</p>; 

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
            onClick={() => onEdit(el.id)}
          ></i>
          <i
            className="fa-solid fa-trash text-danger me-2"
            role="presentation"
            title={t('delete')}
            onClick={() => onDelete(el.id)}
          />
        </div>
      </td>
    </tr>
  ));

  return (
    <div>
      <Row>
        <Col>
          <ClientTable responsive bordered className="mt-1">
            <thead>
              <tr>
                <th>{t('placeName')}</th>
                <th>{t('name')}</th>
                <th>{t('amount')}</th>
                <th>{t('phoneNo')}</th>
                <th>{t('active')}</th>
                <th className="text-end">{t('options')}</th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </ClientTable>
        </Col>
      </Row>
    </div>
  );
};

export default TransactionList;
