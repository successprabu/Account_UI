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
      if (!userDetail || userDetail.customerID === 0) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const [summaryResponse, detailResponse] = await Promise.all([
          API_SERVICE.get(DASHBOARD_SUMMARY_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
            userId: userDetail.id,
          }),
          API_SERVICE.get(DASHBOARD_DETAIL_API, {
            customer_id: userDetail.customerID,
            function_id: userDetail.functionId,
            user_type: userDetail.userType,
            userId: userDetail.id,
          }),
        ]);

        if (summaryResponse.data.result && detailResponse.data.result) {
          setDashboardData(summaryResponse.data.data);
          setDashboardDetail(detailResponse.data.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("An error occurred: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Unauthorized />;
  if (error) return <div className="text-danger">Error: {error}</div>;

  const COLORSFORRECORDS = ["#FFBB28", "#00C49F"];
  const COLORSFORAMOUNT = ["#0088FE", "#FF8042"];

  const tiles = [
    {
      titleKey: "dashbordTotalAmount",
      total: `Rs.${dashboardData.totalRcdAmount?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave size={50} />,
      handleClick: () => setShowClientListModal(true),
      color: "#0088FE",
    },
    {
      titleKey: "dashbordTotalTrans",
      total: dashboardData.totalRcdTransaction || 0,
      icon: <FaClipboardCheck size={50} />,
      color: "#FFBB28",
    },
    {
      titleKey: "dashbordTotalPlaces",
      total: dashboardData.totalPlaces || 0,
      icon: <FaMapMarkerAlt size={50} />,
      color: "#00C49F",
    },
    {
      titleKey: "dashbordTotalExpenase",
      total: dashboardData.totalExpenses || 0,
      icon: <FaWallet size={50} />,
      color: "#FF8042",
    },
  ];

  return (
    <div>
      <Header
        titles={[t("dashboard")]}
        links={[{ to: "/purchase", label: t("addClient") }]}
      />

      <div className="tiles-container">
        <Row>
          {tiles.map((tile, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-3">
              <Card style={{ backgroundColor: tile.color, color: "#fff", cursor: "pointer" }}>
                <Card.Body className="d-flex align-items-center p-3">
                  <div className="me-3">{tile.icon}</div>
                  <div className="flex-grow-1 text-center">
                    <Card.Title>{t(tile.titleKey)}</Card.Title>
                    <Card.Text className="fs-4 fw-bold">
                      {tile.handleClick ? (
                        <a
                          href="#!"
                          onClick={(e) => {
                            e.preventDefault();
                            tile.handleClick();
                          }}
                          style={{ color: "white", textDecoration: "none" }}
                        >
                          {tile.total}
                        </a>
                      ) : (
                        tile.total
                      )}
                    </Card.Text>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Row className="my-4">
        <Col lg={6} className="mb-4">
          <h5>{t("totalRcdNosVsTotalExpenses")}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardDetail}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="transactionCount" fill="#ffc658" name={t("totalRcdNos")} />
              <Bar dataKey="expenseCount" fill="#82ca9d" name={t("totalExpenase")} />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col lg={6} className="mb-4">
          <h5>{t("totalRcdAmountVsTotalExpenses")}</h5>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardDetail}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="transactions" stroke="#ffc658" fill="#ffc658" name={t("totalRcdAmount")} />
              <Area type="monotone" dataKey="expenses" stroke="#82ca9d" fill="#82ca9d" name={t("totalExpenase")} />
            </AreaChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <hr />

      <Row className="my-4">
        <Col lg={6} className="mb-4">
          <h5>{t("totalRcdNosVsTotalExpenses")}</h5>
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
                dataKey="value"
                label
              >
                {dashboardDetail.map((_, index) => (
                  <Cell key={index} fill={COLORSFORRECORDS[index % COLORSFORRECORDS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>

        <Col lg={6} className="mb-4">
          <h5>{t("totalRcdAmountVsTotalExpenses")}</h5>
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
                dataKey="value"
                label
              >
                {dashboardDetail.map((_, index) => (
                  <Cell key={index} fill={COLORSFORAMOUNT[index % COLORSFORAMOUNT.length]} />
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
        <Modal.Body>
          {/* TODO: Replace with client list component or details */}
          <p>{t("clientListWillBeShownHere")}</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardAdmin;
