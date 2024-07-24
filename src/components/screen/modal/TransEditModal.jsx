import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const TransEditModal = ({ show, onHide, transaction, setTransaction, onSave }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: 'var(--bs-primary)', fontWeight: 'bold' }}>{t('editTransaction')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {transaction && (
          <Form>
            <Form.Group controlId="formEditName">
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control
                type="text"
                value={transaction.name}
                onChange={(e) => setTransaction({ ...transaction, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEditPlaceName">
              <Form.Label>{t('placeName')}</Form.Label>
              <Form.Control
                type="text"
                value={transaction.villageName}
                onChange={(e) => setTransaction({ ...transaction, villageName: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEditMobile">
              <Form.Label>{t('phoneNo')}</Form.Label>
              <Form.Control
                type="text"
                value={transaction.phoneNo}
                onChange={(e) => setTransaction({ ...transaction, phoneNo: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEditAmount">
              <Form.Label>{t('amount')}</Form.Label>
              <Form.Control
                type="number"
                value={transaction.amount}
                onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEditActive">
              <Form.Check
                type="checkbox"
                label={t('active')}
                checked={transaction.isActive}
                onChange={(e) => setTransaction({ ...transaction, isActive: e.target.checked })}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('cancel')}
        </Button>
        <Button variant="primary" onClick={onSave}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransEditModal;
