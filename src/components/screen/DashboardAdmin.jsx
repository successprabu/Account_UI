import React, { useState, useEffect } from "react";
import { Modal, Card, Row, Col } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaWallet,
  FaChartBar,
  FaChartArea,
  FaChartPie
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

  if (isLoading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (!isAuthenticated) return <Unauthorized />;
  if (error) return <div className="alert alert-danger m-3">Error: {error}</div>;

  const COLORSFORRECORDS = ["#6366F1", "#10B981"];
  const COLORSFORAMOUNT = ["#3B82F6", "#F59E0B"];

  const tiles = [
    {
      titleKey: "dashbordTotalAmount",
      total: `Rs.${dashboardData.totalRcdAmount?.toFixed(2) || 0}`,
      icon: <FaMoneyBillWave size={24} />,
      handleClick: () => setShowClientListModal(true),
      color: "bg-indigo-100 text-indigo-800",
      border: "border-left-indigo",
    },
    {
      titleKey: "dashbordTotalTrans",
      total: dashboardData.totalRcdTransaction || 0,
      icon: <FaClipboardCheck size={24} />,
      color: "bg-amber-100 text-amber-800",
      border: "border-left-amber",
    },
    {
      titleKey: "dashbordTotalPlaces",
      total: dashboardData.totalPlaces || 0,
      icon: <FaMapMarkerAlt size={24} />,
      color: "bg-emerald-100 text-emerald-800",
      border: "border-left-emerald",
    },
    {
      titleKey: "dashbordTotalExpenase",
      total: dashboardData.totalExpenses || 0,
      icon: <FaWallet size={24} />,
      color: "bg-orange-100 text-orange-800",
      border: "border-left-orange",
    },
  ];

  return (
    <div className="dashboard-container bg-gray-50 min-vh-100">
      <Header
        titles={[t("dashboard")]}
        links={[{ to: "/purchase", label: t("addClient") }]}
      />

      <div className="container-fluid py-4">
        {/* Summary Cards */}
        <div className="row g-4 mb-4">
          {tiles.map((tile, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div 
                className={`card border-0 shadow-sm h-100 ${tile.color} ${tile.border} border-left-4`}
                onClick={tile.handleClick || undefined}
                style={{ cursor: tile.handleClick ? 'pointer' : 'default' }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className={`p-3 rounded-circle ${tile.color.replace('100', '200')} me-3`}>
                      {tile.icon}
                    </div>
                    <div>
                      <h6 className="text-uppercase text-muted mb-0">{t(tile.titleKey)}</h6>
                      <h3 className="mb-0 fw-bold">
                        {tile.handleClick ? (
                          <a
                            href="#!"
                            onClick={(e) => {
                              e.preventDefault();
                              tile.handleClick();
                            }}
                            className="text-decoration-none"
                            style={{ color: 'inherit' }}
                          >
                            {tile.total}
                          </a>
                        ) : (
                          tile.total
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 d-flex align-items-center">
                <FaChartBar className="me-2 text-primary" />
                <h5 className="mb-0">{t("totalRcdNosVsTotalExpenses")}</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardDetail}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="transactionCount" 
                        fill="#6366F1" 
                        name={t("totalRcdNos")} 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="expenseCount" 
                        fill="#10B981" 
                        name={t("totalExpenase")} 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 d-flex align-items-center">
                <FaChartArea className="me-2 text-primary" />
                <h5 className="mb-0">{t("totalRcdAmountVsTotalExpenses")}</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardDetail}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#6366F1" 
                        fill="#6366F1" 
                        fillOpacity={0.2}
                        name={t("totalRcdAmount")} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.2}
                        name={t("totalExpenase")} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 d-flex align-items-center">
                <FaChartPie className="me-2 text-primary" />
                <h5 className="mb-0">{t("totalRcdNosVsTotalExpenses")}</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardDetail.map((item) => ({
                          name: t("totalRcdNos"),
                          value: item.transactionCount,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardDetail.map((_, index) => (
                          <Cell 
                            key={index} 
                            fill={COLORSFORRECORDS[index % COLORSFORRECORDS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, t("totalRcdNos")]}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 d-flex align-items-center">
                <FaChartPie className="me-2 text-primary" />
                <h5 className="mb-0">{t("totalRcdAmountVsTotalExpenses")}</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardDetail.map((item) => ({
                          name: t("totalRcdAmount"),
                          value: item.transactions,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {dashboardDetail.map((_, index) => (
                          <Cell 
                            key={index} 
                            fill={COLORSFORAMOUNT[index % COLORSFORAMOUNT.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, t("totalRcdAmount")]}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        size="lg"
        show={showClientListModal}
        onHide={() => setShowClientListModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{t("recentlyCreatedClients")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="alert alert-info">
            {t("clientListWillBeShownHere")}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardAdmin;