import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const TransDeleteModal = ({ show, onHide, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: 'var(--bs-primary)', fontWeight: 'bold' }}>{t('deleteConfirmation')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{t('deleteConfirmationMessage')}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('cancel')}
        </Button>
        <Button variant="danger" onClick={onDelete}>
          {t('delete')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransDeleteModal;
