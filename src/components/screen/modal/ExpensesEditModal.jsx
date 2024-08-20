import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import InputWithMicrophone from '../../common/InputWithMicrophone';

const ExpensesEditModal = ({ show, onHide, transaction, setTransaction, onSave }) => {
  const { t } = useTranslation();

  const handleAmountChange = (newValue, field) => {
    setTransaction(prevTransaction => ({
      ...prevTransaction,
      [field]: newValue,
    }));
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: 'var(--bs-primary)', fontWeight: 'bold' }}>
          {t('editExpenses')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {transaction && (
          <Form>
            <Form.Group controlId="formEditPlaceName">
              <Form.Label>{t('expensesCategory')}</Form.Label>
              <InputWithMicrophone  
                type="text"
                name="villageName"
                placeholder={t('expensesCategory')}
                value={transaction.villageName || ''}
                onChange={(e) => handleAmountChange(e.target.value, 'villageName')}
              />
            </Form.Group>
            <Form.Group controlId="formEditName">
              <Form.Label>{t('expensesDescription')}</Form.Label>
              <InputWithMicrophone           
                type="text"
                name="name"
                placeholder={t('expensesDescription')}
                value={transaction.name || ''}
                onChange={(e) => handleAmountChange(e.target.value, 'name')}
              />
            </Form.Group>           
            <Form.Group controlId="formEditMobile">
              <Form.Label>{t('phoneNo')}</Form.Label>
              <InputWithMicrophone
                type="text"
                name="phoneNo"
                placeholder={t('phoneNo')}
                value={transaction.phoneNo || ''}
                onChange={(e) =>  handleAmountChange(e.target.value, 'phoneNo')}
              />
            </Form.Group>
            <Form.Group controlId="formEditAmount">
              <Form.Label>{t('amount')}</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                placeholder={t('amount')}
                value={transaction.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value, 'amount')}
              />
            </Form.Group>
            <Form.Group controlId="formEditActive">
              <Form.Check
                type="checkbox"
                label={t('active')}
                checked={transaction.isActive || false}
                onChange={(e) => setTransaction(prevTransaction => ({
                  ...prevTransaction,
                  isActive: e.target.checked,
                }))}
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

export default ExpensesEditModal;
