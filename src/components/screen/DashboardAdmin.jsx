import React, { useState, useEffect } from "react";
import { Modal, Card, Row, Col } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaWallet,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../common/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { DASHBOARD_SUMMARY_API, DASHBOARD_DETAIL_API } from "../common/CommonApiURL";
import { API_SERVICE } from "../common/CommonMethod";
import Unauthorized from "../common/UnauthorizedAccess";

const DashboardAdmin = () => {
  const [showClientListModal, setShowClientListModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [dashboardDetail, setDashboardDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userDetail = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (userDetail.customerID === 0) {
          setIsAuthenticated(false);
        }

        if (!isAuthenticated) {
          return;
        }

        const [summaryResponse, detailResponse] = await Promise.all([
          API_SERVICE.get(DASHBOARD_SUMMARY_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
          }),
          API_SERVICE.get(DASHBOARD_DETAIL_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
          }),
        ]);

        if (summaryResponse.data.result && detailResponse.data.result) {
          setDashboardData(summaryResponse.data.data);
          setDashboardDetail(detailResponse.data.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (error) {
        setError("An error occurred while fetching dashboard data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, userDetail]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Unauthorized />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const tiles = [
    {
      title: t("dashbordTotalAmount"),
      total: `Rs.${dashboardData.totalRcdAmount?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave size={50} />,
      handleClick: () => setShowClientListModal(true),
      color: "#0088FE",
    },
    {
      title: t("dashbordTotalTrans"),
      total: dashboardData.totalRcdTransaction || 0,
      icon: <FaClipboardCheck size={50} />,
      color: "#FFBB28",
    },
    {
      title: t("dashbordTotalPlaces"),
      total: dashboardData.totalPlaces || 0,
      icon: <FaMapMarkerAlt size={50} />,
      color: "#00C49F",
    },
    {
      title: t("dashbordTotalExpenase"),
      total: dashboardData.totalExpenses || 0,
      icon: <FaWallet size={50} />,
      color: "#FF8042",
    },
  ];

  const COLORSFORRECORDS = ["#FFBB28", "#00C49F"];
  const COLORSFORAMOUNT = ["#0088FE", "#FF8042"];

  return (
    <div>
      <Header
        titles={[t("dashboard")]}
        links={[{ to: "/purchase", label: t("addClient") }]}
      />
      <div className="tiles-container">
        <Row>
          {tiles.map((tile, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Card style={{ backgroundColor: tile.color, color: "white" }}>
                <Card.Body
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                  }}
                >
                  <div style={{ marginRight: "10px" }}>{tile.icon}</div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Card.Title style={{ textAlign: "center" }}>
                      {t(tile.title)}
                    </Card.Title>
                    <Card.Text
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      <a
                        href="#"
                        onClick={tile.handleClick}
                        style={{ color: "white" }}
                      >
                        {tile.total}
                      </a>
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
          <h4>{t("totalRcdNosVsTotalExpenses")}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardDetail}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactionCount" fill="#ffc658" />
              <Bar dataKey="expenseCount" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <h4>{t("totalRcdAmountVsTotalExpenses")}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardDetail}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="#ffc658"
                fill="#ffc658"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <hr style={{ borderWidth: "2px", borderColor: "#ccc" }} />

      <Row className="mt-4 mb-4">
        <Col xs={12} lg={6} className="mb-4">
          <h4>{t("totalRcdNosVsTotalExpenses")}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardDetail.map((item) => ({
                  name: t("totalRcdNos"),
                  value: item.transactionCount,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {dashboardDetail.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORSFORRECORDS[index % COLORSFORRECORDS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col xs={12} lg={6} className="mb-4">
          <h4>{t("totalRcdAmountVsTotalExpenses")}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardDetail.map((item) => ({
                  name: t("totalRcdAmount"),
                  value: item.transactions,
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#FF8042"
                dataKey="value"
                label
              >
                {dashboardDetail.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORSFORAMOUNT[index % COLORSFORAMOUNT.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <Modal
        size="lg"
        show={showClientListModal}
        onHide={() => setShowClientListModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("recentlyCreatedClients")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{/* Add content here for client list */}</Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardAdmin;
