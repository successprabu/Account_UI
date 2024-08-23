import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import InputWithMicrophone from "../../common/InputWithMicrophone";
import { API_SERVICE } from "../../common/CommonMethod";
import { SAVE_HANDOVER_API } from "../../common/CommonApiURL";
import { toast } from "react-toastify";

const HandoverEditModal = ({ show, onHide, handoverData, onSave }) => {
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    id: 0,
    customerId: user?.customerID ?? 0,
    functionId: user?.customerID ?? 0,
    handoverBy: "",
    receivedBy: "",
    receivedByMoible: "",
    totalRcdAmount: 0,
    handoverAmount: 0,
    differnceAmount: 0,
    remarks: "",
    createdBy: user?.id ?? 0,
    createdDt: new Date().toISOString(),
    updatedBy: user?.id ?? 0,
    updatedDt: new Date().toISOString(),
    isActive: true,
    status: 1
  });

  useEffect(() => {
    if (handoverData) {
      setFormData({
        ...formData, // Spread the current state to preserve existing values
        id: handoverData?.id || 0,
        handoverBy: handoverData?.username || "",
        receivedBy: handoverData?.receivedBy || "",
        totalRcdAmount: handoverData?.receipt || 0,
        remarks: handoverData?.remarks || "",
        isActive: handoverData?.isActive ?? true,
        status: handoverData?.status || 1
      });
    }
  }, [handoverData]);

  const handleInputChange = (newValue, field) => {
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [field]: newValue
      };

      if (field === "totalRcdAmount" || field === "handoverAmount") {
        updatedFormData.differnceAmount = updatedFormData.totalRcdAmount - updatedFormData.handoverAmount;
      }

      return updatedFormData;
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        handoverBy: Number(handoverData.userId), // Send userId in payload
      };
      const response = await API_SERVICE.post(SAVE_HANDOVER_API, payload);

      if (response.data.result) {
        onSave(formData); // Pass updated data back to parent
        setFormData({
          id: 0,
          customerId: user?.customerID ?? 0,
          functionId: user?.customerID ?? 0,
          handoverBy: 0,
          receivedBy: "",
          receivedByMoible: "",
          totalRcdAmount: 0,
          handoverAmount: 0,
          differnceAmount: 0,
          remarks: "",
          createdBy: "",
          createdDt: new Date().toISOString(),
          updatedBy: "",
          updatedDt: new Date().toISOString(),
          isActive: true,
          status: 1
        });

        onHide(); // Close modal after saving
        toast.success("Handover Completed Successfully");
      } else {
        toast.error(response.data.message || "Something went wrong on Handover. Please try again.");
      }
    } catch (error) {
      console.error("There was an error saving the handover!", error);
      toast.error("There was an error saving the handover! Please try again.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t("editHandover")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formReceivedBy">
            <Form.Label>{t("hanoverBy")}</Form.Label>
            <Form.Control
              type="text"
              name="hanoverBy"
              placeholder={t("hanoverBy")}
              value={formData.handoverBy || ""}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formReceipt">
            <Form.Label>{t("receivedAmount")}</Form.Label>
            <Form.Control
              type="text"
              name="totalRcdAmount"
              value={formData.totalRcdAmount || ""}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formHandoverAmount">
            <Form.Label>{t("handoverAmount")}</Form.Label>
         
            <InputWithMicrophone
              type="number"
              name="handoverAmount"
              placeholder={t("handoverAmount")}
              value={formData.handoverAmount || ""}
              onChange={(e) => handleInputChange(Number(e.target.value), "handoverAmount")}
            />
          </Form.Group>
          <Form.Group controlId="formReceivedBy">
            <Form.Label>{t("receivedBy")}</Form.Label>
            <InputWithMicrophone
              type="text"
              name="receivedBy"
              placeholder={t("receivedBy")}
              value={formData.receivedBy || ""}
              onChange={(e) => handleInputChange(e.target.value, "receivedBy")}
            />
          </Form.Group>
          <Form.Group controlId="formReceivedByMobile">
            <Form.Label>{t("receivedByMobile")}</Form.Label>
            <InputWithMicrophone
              type="text"
              name="receivedByMoible"
              placeholder={t("receivedByMobile")}
              value={formData.receivedByMoible || ""}
              onChange={(e) => handleInputChange(e.target.value, "receivedByMoible")}
            />
          </Form.Group>
          <Form.Group controlId="formDiffernceAmount">
            <Form.Label>{t("differnceAmount")}</Form.Label>
            <Form.Control
              type="number"
              name="differnceAmount"
              placeholder={t("differnceAmount")}
              value={formData.differnceAmount || ""}
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formRemarks">
            <Form.Label>{t("remarks")}</Form.Label>
            <InputWithMicrophone
              as="textarea"
              rows={3}
              name="remarks"
              placeholder={t("remarks")}
              value={formData.remarks || ""}
              onChange={(e) => handleInputChange(e.target.value, "remarks")}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HandoverEditModal;
