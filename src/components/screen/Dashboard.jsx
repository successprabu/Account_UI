import React, { useState } from "react";
import { Modal, Button, Card } from "react-bootstrap";
import ClientList from "./list/ClientList";
import { useTranslation } from "react-i18next";
import Header from "../common/Header";

const Dashboard = () => {
  const [showClientListModal, setShowClientListModal] = useState(false);

  const handleShowClientListModal = () => setShowClientListModal(true);
  const handleCloseClientListModal = () => setShowClientListModal(false);

  const { t } = useTranslation();

  const tiles = [
    { title: "Clients", total: 52, lastModified: "15-10-2024", image: "client.png", handleClick: handleShowClientListModal },
    { title: "Transactions", total: 120, lastModified: "14-10-2024", image: "client.png" },
    { title: "Functions", total: 30, lastModified: "13-10-2024", image: "client.png" },
    { title: "Users", total: 200, lastModified: "12-10-2024", image: "client.png" }
  ];

  return (
    <div>
      <Header
          titles={[t("dashboard")]}
          links={[
            { to: "/purchase", label: t("addClient") }
          ]}
        />
      <div className="tiles-container" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        {tiles.map((tile, index) => (
          <Card key={index} style={{ width: '18rem' }}>
            <Card.Body style={{ display: 'flex', alignItems: 'center' }}>
              <img src={tile.image} alt={tile.title} style={{ width: '70px', height:'100px', marginRight: '10px' }} />
              <div>
                <Card.Title>{tile.title}</Card.Title>
                <Card.Text>
                  Total: <a href="#" onClick={tile.handleClick}>{tile.total}</a><br />
                  Last Modified: {tile.lastModified}
                </Card.Text>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal show={showClientListModal} onHide={handleCloseClientListModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Client List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClientList showHeader={false} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientListModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <h1>Recently Added Clients</h1>
        <ClientList showHeader={false} />
      </div>
    </div>
  );
};

export default Dashboard;
