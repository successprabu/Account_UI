import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";

const ImportPreview = ({
  show,
  onClose,
  onFiles,
  records = [],
  onRecordsChange,
  onSaveSelected,
  isProcessing = false,
}) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // reset selection when records change
    setSelectedIds(new Set(records.map((r, idx) => r._importId ?? idx)));
    setSelectAll(records.length > 0);
  }, [records]);

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFiles(files);
    }
  };

  const toggleRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setSelectAll(next.size === records.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(records.map((r, idx) => r._importId ?? idx)));
      setSelectAll(true);
    }
  };

  const handleSave = () => {
    onSaveSelected(Array.from(selectedIds));
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Import Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileInput} />
        </div>
        <div className="mb-2">
          <strong>Files parsed:</strong> {records.length}
        </div>
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th style={{width:40}}>
                <Form.Check checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th>Village</th>
              <th>Name</th>
              <th>Initial</th>
              <th>Old Amount</th>
              <th>New Amount</th>
              <th>Total</th>
              <th>Phone</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => {
              const id = r._importId ?? idx;
              return (
                <tr key={id}>
                  <td>
                    <Form.Check
                      checked={selectedIds.has(id)}
                      onChange={() => toggleRow(id)}
                    />
                  </td>
                  <td>{r.villageName}</td>
                  <td>{r.name}</td>
                  <td>{r.initial}</td>
                  <td>{r.oldAmount}</td>
                  <td>{r.newAmount}</td>
                  <td>{r.amount}</td>
                  <td>{r.phoneNo}</td>
                  <td>{r.remarks}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isProcessing || selectedIds.size===0}>
          {isProcessing ? "Processing..." : "Save Selected"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportPreview;
