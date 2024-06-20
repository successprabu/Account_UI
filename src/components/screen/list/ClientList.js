import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { ClientTable } from "../css/styled";
import { API_SERVICE } from "../../common/CommonMethod";
import { LIST_CLIENT_API } from "../../common/CommonApiURL";
import UnauthorizedAccess from "../../common/UnauthorizedAccess"; 
import { useNavigate } from "react-router-dom";

const onEdit = (arg) => {
  console.log(arg);
};
const onDelete = (arg) => {
  console.log(arg);
};

const ClientList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching client list");
    const user = localStorage.getItem("user");
    if (!user) {
      setIsAuthenticated(false);
      return;
    }

    API_SERVICE.get(LIST_CLIENT_API)
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setCustomerList(response.data.data);
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

  if (customerList.length === 0) return <p>No Data Available...</p>; 

  const list = customerList.map((el) => (
    <tr key={el.id}>
      <td>{el.name}</td>
      <td>{el.primary_phone}</td>
      <td>{el.is_primary_phone_whatsup ? "Yes" : "No"}</td>
      <td>{el.isActive ? "Yes" : "No"}</td>
      <td>
        <div className="d-flex justify-content-end">
          <i
            className="fa-solid fa-pen-to-square text-primary me-2"
            role="presentation"
            onClick={() => onEdit(el.id)}
          ></i>
          <i
            className="fa-solid fa-trash text-danger me-2"
            role="presentation"
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
                <th>Customer Name</th>
                <th>Contact Number</th>
                <th>WhatsApp</th>
                <th>Active</th>
                <th className="text-end">Options</th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </ClientTable>
        </Col>
      </Row>
    </div>
  );
};

export default ClientList;
