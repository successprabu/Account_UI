import React, {useEffect, useState } from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaMoneyCheckAlt, FaCog, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import ClientList from "./list/ClientList";
import { useTranslation } from "react-i18next";
import Header from "../common/Header";


const Dashboard = () => {
  const [showClientListModal, setShowClientListModal] = useState(false);

  const handleShowClientListModal = () => setShowClientListModal(true);
  const handleCloseClientListModal = () => setShowClientListModal(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tiles = [
    { title: "clients", total: 52, lastModified: "15-10-2024", icon: <FaUsers size={50} />, handleClick: handleShowClientListModal, color: "blue" },
    { title: "transactions", total: 120, lastModified: "14-10-2024", icon: <FaMoneyCheckAlt size={50} />, color: "orange" },
    { title: "functions", total: 30, lastModified: "13-10-2024", icon: <FaCog size={50} />, color: "green" },
    { title: "users", total: 200, lastModified: "12-10-2024", icon: <FaUser size={50} />, color: "red" }
  ];

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userDetail = JSON.parse(user);
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  }, [navigate]);
  return (
    <div>
      <Header
        titles={[t("dashboard")]}
        links={[
          { to: "/purchase", label: t("addClient") }
        ]}
      />
      <div className="tiles-container">
        <Row>
          {tiles.map((tile, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Card style={{ backgroundColor: tile.color, color: 'white' }}>
                <Card.Body style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                  <div style={{ marginRight: '10px' }}>
                    {tile.icon}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Card.Title style={{ textAlign: 'center' }}>{t(tile.title)}</Card.Title>
                    <Card.Text style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center' }}>
                      <a href="#" onClick={tile.handleClick} style={{ color: 'white' }}>{tile.total}</a>
                    </Card.Text>
                    <Card.Text style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                      {t("lastModified")}: {tile.lastModified}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Modal show={showClientListModal} onHide={handleCloseClientListModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t("clientList")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClientList showHeader={false} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientListModal}>
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <h1>{t("recentlyCreated")}</h1>
        <ClientList showHeader={false} />
      </div>
    </div>
  );
};

export default Dashboard;
