import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const OthersSummaryModal = ({ show, handleClose, othersData }) => {

    const { t } = useTranslation();

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("othersSummary")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('itemName')}</th>
              <th>{t('itemTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {othersData.map((item, index) => (
              <tr key={index}>
                <td>{t(item.othersType) || "N/A"}</td>
                <td>{item.totalOthers}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OthersSummaryModal;
