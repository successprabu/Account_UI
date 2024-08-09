import React, { useEffect, useState } from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaMoneyCheckAlt, FaGifts, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import ClientList from "./list/ClientList";
import { useTranslation } from "react-i18next";
import Header from "../common/Header";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer 
} from "recharts";

const Dashboard = () => {
  const [showClientListModal, setShowClientListModal] = useState(false);

  const handleShowClientListModal = () => setShowClientListModal(true);
  const handleCloseClientListModal = () => setShowClientListModal(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tiles = [
    { title: "clients", total: 52, lastModified: "15-10-2024", icon: <FaUsers size={50} />, handleClick: handleShowClientListModal, color: "#0088FE" },
    { title: "transactions", total: 120, lastModified: "14-10-2024", icon: <FaMoneyCheckAlt size={50} />, color: "#FFBB28" },
    { title: "functions", total: 30, lastModified: "13-10-2024", icon: <FaGifts size={50} />, color: "#00C49F" },
    { title: "users", total: 200, lastModified: "12-10-2024", icon: <FaUser size={50} />, color: "#FF8042" }
  ];

  // Sample data for charts
  const data = [
    { name: "January", clients: 30, transactions: 100, functions: 10, users: 150 },
    { name: "February", clients: 20, transactions: 120, functions: 15, users: 180 },
    { name: "March", clients: 50, transactions: 200, functions: 20, users: 200 },
  ];

  const pieData = [
    { name: "Clients", value: 52 },
    { name: "Transactions", value: 120 },
    { name: "Functions", value: 30 },
    { name: "Users", value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

      <Row className="mt-4 mb-4">
        <Col xs={12} lg={6} className="mb-4">
          <h4>Column Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="clients" fill="#8884d8" />
              <Bar dataKey="transactions" fill="#82ca9d" />
              <Bar dataKey="functions" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <h4>Area Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="clients" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="transactions" stroke="#82ca9d" fill="#82ca9d" />
              <Area type="monotone" dataKey="functions" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <hr style={{ borderWidth: '2px', borderColor: '#ccc' }} />

      <Row className="mt-4 mb-4">
        <Col xs={12} lg={6} className="mb-4">
          <h4>Pie Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <h4>Line Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clients" stroke="#8884d8" />
              <Line type="monotone" dataKey="transactions" stroke="#82ca9d" />
              <Line type="monotone" dataKey="functions" stroke="#ffc658" />
              <Line type="monotone" dataKey="users" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
