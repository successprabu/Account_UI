import React from "react";
import axios from "axios";

import { LIST_CLIENT_API } from "../../common/CommonApiURL";
import { Row, Col } from "react-bootstrap";
import { ClientTable } from "../css/styled";

const onEdit = (arg) => {
  console.logarg();
};
const onDelete = (arg) => {
  console.logarg();
};

const ClientList = () => {
  const [clietList, setClietList] = React.useState(null);

  React.useEffect(() => {
    axios.get(LIST_CLIENT_API).then((response) => {
      setClietList(response.data);
    });
  }, []);
  console.log(clietList);
  if (!clietList) return null;
  const list = clietList.map((el) => (
    <tr key={el.id}>
      <td className="">{el.name}</td>
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
                <th>Whatsup</th>
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
