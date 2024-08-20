import React from "react";
import { Modal, Form, Button, FormLabel, FormSelect  } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import InputWithMicrophone from "../../common/InputWithMicrophone";

const OthersEditModal = ({
  show,
  onHide,
  transaction,
  setTransaction,
  onSave,
}) => {
  const { t } = useTranslation();
 

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "var(--bs-primary)", fontWeight: "bold" }}>
          {t("editOthers")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {transaction && (
          <Form>
            <Form.Group controlId="formEditName">
              <Form.Label>{t("name")}</Form.Label>
              <InputWithMicrophone
                type="text"
                name="name"
                placeholder={t('name')}
                value={transaction.name}
                onChange={(e) =>
                  setTransaction({ ...transaction, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formEditPlaceName">
              <Form.Label>{t("placeName")}</Form.Label>
              <InputWithMicrophone
                type="text"
                name="villageName"
                placeholder={t('placeName')}
                value={transaction.villageName}
                onChange={(e) =>
                  setTransaction({
                    ...transaction,
                    villageName: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group controlId="formEditMobile">
              <Form.Label>{t("phoneNo")}</Form.Label>
              <InputWithMicrophone
                type="text"
                name="phoneNo"
                placeholder={t('phoneNo')}
                value={transaction.phoneNo}
                onChange={(e) =>
                  setTransaction({ ...transaction, phoneNo: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="formEditOldAmount">
              <Form.Label>{t("othersRemarks")}</Form.Label>
              <InputWithMicrophone
                type="text"
                name="othersRemark"
                placeholder={t('othersRemark')}
                value={transaction.othersRemark}
                onChange={(e) =>
                  setTransaction({ ...transaction, othersRemark: e.target.value })
                }
                
              />
            </Form.Group>
            <Form.Group controlId="formEditOldAmount">
              <Form.Label>{t("others")}</Form.Label>
             <InputWithMicrophone
                type="number"
                value={transaction.others}
                onChange={(e) =>
                  setTransaction({ ...transaction, others: e.target.value })
                }
                
              />
            </Form.Group>
            <Form.Group controlId="formEditNewAmount">
              <FormLabel>
                {t("othersType")}
                <span className="text-danger">*</span>
              </FormLabel>
              <FormSelect
                name="othersType"
                placeholder={t('othersType')}
                value={transaction.othersType} // Use the raw value from transaction.othersType
                onChange={(e) =>
                  setTransaction({ ...transaction, othersType: e.target.value })
                }
              >
                <option value="">{t("select")}</option>
                <option value="ring">{t("ring")}</option>
                <option value="jain">{t("jain")}</option>
                <option value="coin">{t("coin")}</option>
                <option value="pattam">{t("pattam")}</option>
                <option value="others">{t("others")}</option>
              </FormSelect>
            </Form.Group>

            <Form.Group controlId="formEditAmount">
              <Form.Label>{t("amount")}</Form.Label>
              <Form.Control type="number" value={transaction.amount} 
              onChange={(e) =>
                setTransaction({ ...transaction, amount: e.target.value })
              }
              />
            </Form.Group>
            <Form.Group controlId="formEditActive">
              <Form.Check
                type="checkbox"
                label={t("active")}
                checked={transaction.isActive}
                onChange={(e) =>
                  setTransaction({ ...transaction, isActive: e.target.checked })
                }
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={onSave}>
          {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OthersEditModal;
